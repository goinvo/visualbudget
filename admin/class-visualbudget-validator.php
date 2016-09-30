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
                        $string_or_array = array_map("str_getcsv", explode("\n", $csv));
                        break;

                    // We must check to see if the JSON is valid, however.
                    case "json":
                        $result = json_decode($string, true);
                        if (is_array($result)) {
                            $string_or_array = $result;
                        } else {
                            // Throw an error; the file apparently isn't valid JSON.
                            return new Error("The file is not valid JSON.");
                        }
                        break;

                    default:
                        // Error, unrecognized filetype.
                        return new Error("Unrecognized filetype " . $strtolower($filetype));
                }
            }
        }

        // Now we know the the variable $string_or_array is actually a PHP
        // array of data. We proceed to check that array against the VB
        // data specification.
        $data_array = $string_or_array;
        return $data_array;
    }

    /**
     * Sanitize incoming data. The sanitization process includes:
     *      - padding the array to make it rectangular
     *      - removing empty rows and columns
     *      - removing unallowed characters from header and level fields
     *      - making the headers all uppercase
     *      - inferring level fields
     *
     * The function returns a sanitized version of the data.
     */
    public static function sanitize_data($data_array) {
        return $data_array;
    }

    /**
     * Check to see whether a PHP is valid budget data according
     * to the VB spec. Returns true on success and an appropriate
     * error on failure.
     */
    public static function is_valid_vb_spec($data_array) {
        return true;
    }

}
