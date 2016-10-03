<?php

/**
 * Class for validating datasets.
 *
 * There are two main types of validation to be done.
 * First, the validation of the incoming file: is it valid
 * CSV or JSON? Second, the validation with respect to the
 * Visual Budget data specification.
 */
class VisualBudget_Validator {

    /**
     * These are all static methods. There is nothing to construct.
     */
    public function __construct() {
    }

    /**
     * Validate a dataset. Input can be either (1) a string and corresponding
     * filetype, or (2) a php array. This function returns a PHP array of
     * validated & normalized data on success, or an error object on failure.
     */
    public static function validate($string_or_array, $filetype=null) {

        // The first argument is either a string or an array.
        if (is_string($string_or_array)) {
            // If it's a string, we must know the filetype.
            if (empty($filetype)) {
                // FIXME: The filetype must be specified if a string is passed.
            } else {
                // We have a string and a filetype, so let's make sure it's
                // well-formed of that filetype and then convert it to a
                // PHP array.
                switch (strtolower($filetype)) {

                    // For CSV there is nothing to be validated, really.
                    // Just explode it by linebreaks and commas.
                    case "csv":
                        $string_or_array = array_map("str_getcsv", explode("\n", $string_or_array));
                        break;

                    // We must check to see if the JSON is valid, however.
                    case "json":
                        $result = json_decode($string_or_array, false);
                        if (is_array($result)) {
                            $string_or_array = $result;
                        } else {
                            // Throw an error; the file apparently isn't valid JSON.
                            return new Error("The file is not valid JSON.");
                        }
                        break;

                    default:
                        // Error, unrecognized filetype.
                        return new Error('Unrecognized filetype "'
                                            . strtolower($filetype) . '".');
                }
            }
        }

        // Now we know the the variable $string_or_array is actually a PHP
        // array of data. We proceed to check that array against the VB
        // data specification.
        $data_array = $string_or_array;

        // Sanitize the new data.
        $data_array = self::sanitize_data($data_array);

        // Check to see that the data is valid according to our spec.
        if ( ! self::is_valid_vb_spec($data_array) ) {
            return new Error('Data is not valid VB budget data.');
        }

        return $data_array;
    }

    /**
     * Sanitize incoming data. The sanitization process includes:
     *      - padding the array to make it rectangular
     *      - removing empty rows and columns
     *      - removing unallowed characters from header and level fields
     *        (that is, slugifying them)
     *      - inferring level fields
     *      - converting everything in timepoint columns to numbers
     *        rather than strings
     *
     * The function returns a sanitized version of the data.
     */
    public static function sanitize_data($data_array) {
        // This sequence of events is pretty self-explanatory.
        $data_array = self::pad_to_rectangle($data_array);
        $data_array = self::trim_all_elements($data_array);
        $data_array = self::remove_empty_rows($data_array);
        $data_array = self::remove_empty_cols($data_array);
        $data_array = self::slugify_headers($data_array, 1);
        // $data_array = self::slugify_levels($data_array, 0);
        // $data_array = self::infer_level_fields($data_array);

        return $data_array;
    }

    /**
     * Pad an array to rectangle. This function always pads on the right.
     * @param  array   $array   The array to be padded.
     * @param  string  $val     The value of newly created array elements.
     */
    public static function pad_to_rectangle($array, $val='') {
        // Note that a 2-dimensional array can only be non-rectangular in
        // the 2nd dimension (i.e. it can have a ragged side, but not a
        // ragged top or bottom).
        $row_lengths = array_map(function($a){return count($a);}, $array);
        $max_length = max($row_lengths);
        foreach($array as $i=>$row) {
            $array[$i] = array_pad($row, $max_length, $val);
        }
        return $array;
    }

    /**
     * Trim whitespace from all elements in a two-dimensional array.
     */
    public static function trim_all_elements($array) {
        $trimmed = array_map(function($a) { return array_map('trim', $a); }, $array);
        return $trimmed;
    }

    /**
     * Given an array, returns a new array where all empty rows have
     * been eliminated.
     * @param  array  $array  An array requiring empty-row removal.
     */
    public static function remove_empty_rows($array) {
        $array = array_filter($array, function($a){
                        // Note that with the following text, a row of all zeros
                        // will be considered empty as well. That is fine for
                        // our purposes.
                        return !empty(array_sum($a));
                    });

        return $array;
    }

    /**
     * Given an array, returns a new array where all empty columns have
     * been eliminated. Note that this function gives unpredictable
     * results if the input is not a square 2-dimensional array.
     *
     * @param  array  $array  An array requiring empty-column removal.
     */
    public static function remove_empty_cols($array) {
        // Just transpose and remove rows, then re-transpose.
        return self::transpose(self::remove_empty_rows(self::transpose($array)));
    }

    /**
     * Transpose a two-dimensional array.
     * This function taken from
     * http://stackoverflow.com/a/3423692/1516307
     */
    public static function transpose($array) {
        array_unshift($array, null);
        return call_user_func_array('array_map', $array);
    }

    /**
     * Returns an array where the elements of the first row
     * have been slugified (meaning they have been lowercased,
     * have had spaces converted to underscores, and have had
     * dangerous characters removed).
     */
    public static function slugify_headers($array) {
        // Loop through and slugify each element of the first row of $array.
        for ($i=0; $i<count($array[0]); $i++) {
            $array[0][$i] = self::slugify($array[0][$i]);
        }
        return $array;
    }


    /**
     * This function is based on code posted at
     * http://stackoverflow.com/a/2955878/1516307
     *
     * @param  int  $case  If $case > 0, text will be capitalized.
     *                     If $case < 0, text will be lowercased.
     *                     If $case == 0, case is left alone.
     */
    public static function slugify($text, $case=1) {
        // replace non letter or digits by underscores
        $text = preg_replace('~[^\pL\d]+~u', '_', $text);
        // transliterate
        $text = iconv('utf-8', 'us-ascii//TRANSLIT', $text);
        // remove unwanted characters
        $text = preg_replace('~[^_\w]+~', '', $text);
        // trim
        $text = trim($text, '_');
        // remove duplicate underscores
        $text = preg_replace('~_+~', '_', $text);
        // lowercase
        if ($case > 0) {
          $text = strtoupper($text);
        } elseif ($case < 0) {
          $text = strtolower($text);
        }
        if (empty($text)) {
          return 'empty_field_name';
        }
        return $text;
    }

    /**
     * Check to see whether a PHP is valid budget data according
     * to the VB spec. Returns true on success and an appropriate
     * error on failure.
     *
     * In particular, this function checks that:
     *      - There is at least one LEVEL column
     *      - There is at least one timepoint column
     *      - There are at least two rows (header + line item)
     */
    public static function is_valid_vb_spec($data_array) {
        return true;
    }

}
