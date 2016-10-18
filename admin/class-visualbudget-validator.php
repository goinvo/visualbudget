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
     * This is a reference to the admin's notifier object.
     */
    private $notifier;

    /**
     * The notifier is the only reason these methods are not all static.
     */
    public function __construct($notifier) {
        $this->notifier = $notifier;
    }

    /**
     * Validate a dataset. Input can be either (1) a string and corresponding
     * filetype, or (2) a php array. This function returns a PHP array of
     * validated & normalized data on success, or an error object on failure.
     */
    public function validate($string_or_array, $filetype=null) {

        // The first argument is either a string or an array.
        if (is_string($string_or_array)) {

            // If it's a string, we must know the filetype.
            if (empty($filetype)) {

                // The uploaded file has no file extension. Let the user know
                // that that is most definitely not kosher, not kosher at all.
                $this->notifier->add('Uploaded file must have a file extension. '
                                . 'Accepted filetypes are CSV and JSON.', 'error');
                return 0;

            } else {

                // We have a string and a filetype, so let's make sure it's
                // well-formed of that filetype and then convert it to a
                // PHP array.

                // Before anything, standardize the line endings of our string.
                $string_or_array = preg_replace('~\R~u', "\r\n", $string_or_array);

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
                            // The file apparently isn't valid JSON.
                            $this->notifier->add('The file is not valid JSON.', 'error');
                            return 0;
                        }
                        break;

                    default:
                        // Unrecognized filetype.
                        $this->notifier->add('Unrecognized filetype "'
                                    . strtolower($filetype) . '". Data files must be'
                                    . ' either CSV or JSON.', 'error');
                        return 0;
                }
            }
        }

        // Now we know the the variable $string_or_array is actually a PHP
        // array of data. We proceed to check that array against the VB
        // data specification.
        $data_array = $string_or_array;

        // Sanitize the new data.
        $data_array = $this->sanitize_data($data_array);

        // Check to see that the data is valid according to our spec.
        if ( ! $this->is_valid_vb_spec($data_array) ) {
            // The function is_valid_vb_spec will queue up any errors
            // or warnings it finds. Simply return 0 here.
            return 0;
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
    public function sanitize_data($data_array) {
        // This sequence of events is pretty self-explanatory.
        $data_array = $this->pad_to_rectangle($data_array);
        $data_array = self::trim_all_elements($data_array);
        $data_array = self::remove_empty_rows($data_array);
        $data_array = self::remove_empty_cols($data_array);
        $data_array = $this->slugify_headers($data_array, 0);
        // $data_array = self::slugify_levels($data_array, 0, array('/#/'=>'num'));
        $data_array = $this->infer_levels($data_array);

        return $data_array;
    }

    /**
     * Pad an array to rectangle. This function always pads on the right.
     * @param  array   $array   The array to be padded.
     * @param  string  $val     The value of newly created array elements.
     */
    public function pad_to_rectangle($array, $val='') {
        // Note that due to the nature of the data structure,
        // a 2-dimensional array can only be non-rectangular in
        // the 2nd dimension (i.e. it can have a ragged side, but not a
        // ragged top or bottom).
        $row_lengths = array_map(function($a){return count($a);}, $array);

        if (count(array_unique($row_lengths)) > 1) {
            $this->notifier->add('Not all rows of the uploaded dataset were '
                            . 'the same length. Rows have been extended on the '
                            . 'right to rectangularize the dataset.', 'warning');
        }

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
                        return !empty(array_sum(array_map('boolval', $a)));
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
        // array_unshift($array, null);
        // return call_user_func_array('array_map', $array);
        return array_map(null, ...$array);
    }

    /**
     * Returns an array where the elements of the first row
     * have been slugified (meaning they have been lowercased,
     * have had spaces converted to underscores, and have had
     * dangerous characters removed).
     */
    public function slugify_headers($array, $case=1, $custom_mappings=array()) {
        // A counter for empty field names. If any nonempty column doesn't
        // have a header, we will call it UNKNOWN_FIELD_N.
        $empty_counter = 0;

        // Loop through and slugify each element of the first row of $array.
        for ($i=0; $i<count($array[0]); $i++) {
            $slug = self::slugify($array[0][$i], $case, $custom_mappings);
            if (empty($slug)) {
                $slug = "UNKNOWN_FIELD_" . ($empty_counter+1);
                $empty_counter++;
            }
            $array[0][$i] = $slug;
        }

        if ($empty_counter) {
            if ($empty_counter == 1) {
                $text = "One header field was found to be empty. It has "
                        . "been named " . $slug . ".";
            } else {
                $text = $empty_counter . " header fields were found be empty. "
                        . "They have been named by the system.";
            }
            $this->notifier->add($text, 'warning');
        }

        return $array;
    }

    /**
     * Slugify the values of LEVEL fields in each line item.
     */
    public static function slugify_levels($data, $case=-1, $custom_mappings=array()) {

        // Split the dataset into the header row and the rest of the sheet
        $header = $data[0];            // Just the first row
        $data = array_slice($data, 1); // Everything but the first row

        // The categories of all columns. LEVEL cols have category == 1.
        $ordered_levels = self::ordered_columns_of_type($header, 1);

        // Loop through and slugify each LEVEL field of each row.
        foreach ($data as $m => $row) {
            foreach ($ordered_levels as $n => $level_name) {
                $data[$m][$n] = self::slugify($data[$m][$n], $case, $custom_mappings);
            }
        }

        // Prepend the header row back on and then return it.
        array_unshift($data, $header);
        return $data;
    }

    /**
     * This function is based on code posted at
     * http://stackoverflow.com/a/2955878/1516307
     *
     * @param  int  $case  If $case > 0, text will be capitalized.
     *                     If $case < 0, text will be lowercased.
     *                     If $case == 0, case is left alone.
     */
    public static function slugify($text, $case=0, $custom_mappings=array()) {

        // If there are custom mappings, do them first.
        foreach ($custom_mappings as $regex=>$replacement) {
            $text = preg_replace($regex, $replacement, $text);
        }

        // Replace non letter or digits by underscores
        $text = preg_replace('~[^\pL\d]+~u', '_', $text);

        // Transliterate
        $text = iconv('utf-8', 'us-ascii//TRANSLIT', $text);

        // Remove unwanted characters
        $text = preg_replace('~[^_\w]+~', '', $text);

        // Trim
        $text = trim($text, '_');

        // Remove duplicate underscores
        $text = preg_replace('~_+~', '_', $text);

        // Change the case as necessary.
        if ($case > 0) {
          $text = strtoupper($text);
        } elseif ($case < 0) {
          $text = strtolower($text);
        }

        return $text;
    }

    /**
     * Return a dataset equivalent to the input,
     * but with inferred levels filled in.
     */
    public function infer_levels($data) {

        // Split the dataset into the header row and the rest of the sheet
        $header = $data[0];            // Just the first row
        $data = array_slice($data, 1); // Everything but the first row

        // Get an array of the LEVEL column titles, ordered properly
        // and with the correct indices (i.e. indices referring to
        // the levels of the original dataset). See function for details.
        $ordered_levels = array_keys(self::ordered_columns_of_type($header, 1));

        // We will flag rows that aren't inferring properly.
        $flagged_rows = array();

        // Now loop through and fill in the blanks
        foreach ($data as $m => $row) {

            // Skip the first row. There is nothing to infer from.
            if ($m === 0) {
                continue;
            }

            // Two flags. One for checking if we've finished scanning
            // through empty levels. These are the LEVELs of highest
            // number which may not be used. E.g. LEVEL1--3 may be
            // defined, and then there might be an unused LEVEL4 column
            // which should not affect inference.
            $through_scanning_unused_levels = 0;

            // This flag is set to true when inference begins. We use
            // it to check for malformed rows.
            $inference_has_begun = 0;

            // Loop through the level columns on each row, inferring as necessary.
            // We use a while loop rather than a foreach loop because we are
            // walking backwards through the array.
            $n = count($ordered_levels) - 1;
            while ($n+1) {

                // Check to see if the LEVEL field is empty.
                if ( empty($row[$ordered_levels[$n]]) ) {

                    // Check to see if we are done with unused unused LEVELs.
                    if ($through_scanning_unused_levels) {

                        // Infer the value from the row above.
                        // Note that we infer even if we flagged this row:
                        // after all, we need to know all the levels before
                        // we can do anything with the data. So we fill it in
                        // however we're able.
                        $data[$m][$ordered_levels[$n]] = $data[$m-1][$ordered_levels[$n]];

                        // Inference has begun.
                        $inference_has_begun++;
                    }

                } else {
                    // $flag > 0 indicates that we have stopped inferring,
                    // and all LEVELs hereon should be defined explicitly.
                    // If there are any further inferences, we have a problem.
                    $through_scanning_unused_levels++;

                    // Check to see if the row violates inference rules.
                    // If so, flag it.
                    if ($inference_has_begun) {
                        // This is a problem. It means that levels are being
                        // inferred between other levels. Add this row number
                        // to the list of flagged rows. We add 2 to the row
                        // number: +1 for the fact that we've axed the header,
                        // and +1 again because most people looking at this
                        // are going to 1-index the rows.
                        $flagged_rows[] = $m+2;
                    }
                }

                // Decrement the index.
                $n--;
            }
        }

        // If there are flagged rows, we'll want to notify the user of them
        // via the notifier.
        $flagged_rows = array_unique($flagged_rows);
        if ( !empty($flagged_rows) ) {
            // Prettify the text to be written in the notice.
            if (count($flagged_rows) == 1) {
                $text = 'row ' . $flagged_rows[0];
            } elseif (count($flagged_rows) == 2) {
                $text = 'rows ' . implode(' and ', $flagged_rows);
            } else {
                $text = 'rows ' . implode(', ', array_slice($flagged_rows, 0, -1))
                        . ', and ' . end($flagged_rows);
            }

            // Add a warning to the admin dashboard.
            $this->notifier->add('Malformed dataset: Inference between LEVELs '
                    . 'on ' . $text . '. Dataset may have been incorrectly '
                    . 'inferred.', 'warning');
        }

        // Prepend the header row back on and then return it.
        array_unshift($data, $header);
        return $data;
    }

    /**
     * Find out how columns should be ordered, and keep track of their indices.
     *
     * @param  array  $header    The first row of a dataset.
     * @param  int    $category  The category whose indices should be returned.
     *                           Should be either -1, 0, or 1 per the
     *                           categorize_column() function.
     * @return array  Returns an array of integers which represent the indices
     *                of the columns of type $category arranged in ascending
     *                order. For LEVEL columns, that means ascending order of
     *                LEVEL. For timepoint columns, that means ascending order
     *                of date. For metadata columns, that means alphabetical order.
     * @example  For $category = 1, referring to LEVEL columns,
     *           the returned array [4 => "LEVEL1", 7 => "LEVEL2",..]
     *           would mean that LEVEL1 is column 4, LEVEL2 is column 7, etc.
     */
    public static function ordered_columns_of_type($header, $category) {

        // Categorize the columns
        $categories = self::column_categories($header);

        // Filter out non-LEVEL columns. This gets us indices of all LEVEL cols.
        $levels = array_filter($categories,
                        function ($i) use ($category) {
                            return $i === $category;
                        });
        $levels = array_keys($levels);

        // This is what we're after: the indices of the columns of type
        // $category in ascending order.
        $ordered_levels = array_filter($header,
            function($i) use ($levels) {
                return in_array($i, $levels);
            }, ARRAY_FILTER_USE_KEY);
        natcasesort($ordered_levels);

        return $ordered_levels;
    }


    /**
     * Return the number of columns of category $category in $header.
     */
    public static function number_of_columns_of_type($header, $category) {
        return count(self::ordered_columns_of_type($header, $category));
    }

    /**
     * Returns an array the same size as $header_row containing
     * the categories of each element of $header_row as determined
     * by the categorize_column() function.
     *
     * @param  Array  $header_row  Array of strings, the first row of a dataset.
     * @example  column_categories(array('2013','LEVEL1','TOOLTIP'))
     *           returns Array(0, 1, -1)
     */
    public static function column_categories($header_row) {
        return array_map( Array(self,'categorize_column'),
                    $header_row );
    }

    /**
     * Determines if a string is the title of a LEVEL column,
     * a timepoint column, or a metadata column.
     * Returns 1 for LEVEL, 0 for timepoint, -1 for metadata.
     *
     * @param  String  $string  The title of a dataset column.
     *
     * FIXME: Does not understand the format "1Q 2012" or similar
     *        for quarters.
     */
    public static function categorize_column($string) {
        if (preg_match('/^LEVEL[0-9]+$/i', $string)) {
            return 1;  // level
        } elseif (self::is_date($string)) {
            return 0;  // timepoint
        } else {
            return -1; // metadata
        }
    }

    /**
     * Recognize dates, including those of the form "2Q2016" or "Q2 16"
     */
    public static function is_date($string) {
        // "Normal" dates.
        if (strtotime($string) !== false) {
            return true;
        }

        // Quarterly dates.
        if (    preg_match("/([1-4]q|q[1-4]).*([\d]{2,4})/i", $string)
             || preg_match("/([\d]{2,4}).*([1-4]q|q[1-4])/i", $string) ) {
            return true;
        }

        return false;
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
     *
     * FIXME: This should also check that everything in a timepoint column
     *        is a number.
     */
    public function is_valid_vb_spec($data_array) {

        // Check that there are at least two rows.
        if ( count($data_array) < 2 ) {
            $this->notifier->add('There must be at least two rows in the '
                        . 'uploaded dataset.', 'error');
            return false;
        }

        // Split the dataset into the header row and the rest of the sheet
        $header = $data_array[0];                   // Just the first row
        $data_array = array_slice($data_array, 1);  // Everything but the first row

        // Count the number of timepoint columns and check that there is
        // at least one.
        $num_timepoint_cols = count(self::ordered_columns_of_type($header, 0));
        if ($num_timepoint_cols < 1) {
            $this->notifier->add(esc_html('There must be at least one timepoint column. '
                        . 'None were found. Note that syntax for timepoint column '
                        . 'headers is strict: the fieldname must be machine-readable '
                        . 'as a date. Try formats like "2012" or "2012-08" or "3Q 2008".'),
                        'error');
            return false;
        }

        // Count the number of level columns and check that there is
        // at least one.
        $num_level_cols = count(self::ordered_columns_of_type($header, 1));
        if ($num_level_cols < 1) {
            $this->notifier->add(esc_html('There must be at least one LEVEL column. '
                        . 'None were found. Note that syntax for LEVEL column '
                        . 'headers is strict: the fieldname must be of the form '
                        . 'LEVEL<N>, where <N> is an integer.'),
                        'error');
            return false;
        }

        return true;
    }

}
