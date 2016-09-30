<?php

/**
 * Class for representing datasets. This class is used by many other classes,
 * since it is the main interface for slicing and querying datasets
 * on the backend. This class does not, however, write to the filesystem.
 */
class VisualBudget_Dataset {

    // There was a big high wall there
    // That tried to stop me
    // And a sign atop it said
    private $properties;
    // And on the other side
    // It didn't say nothing
    // That side was made for you and me.

    /**
     * The contents of the original dataset, which was either
     * uploaded or retrieved from a given URL.
     *
     * FIXME: This property is only set when the object is being
     * created from an upload or URL; not when the object
     * is being constructed from an existing file in our system.
     */
    private $original_blob;

    /**
     * The actual data, represented as PHP array.
     */
    private $data;

    /**
     * Initialize the class and set its properties.
     * @param  array  $properties    An array of properties. The keys that are
     *                               set determine how the object is constructed.
     *                               If from uploaded file, 'tmp_name' and
     *                                      'uploaded_name' should be set.
     *                               If from URL, 'url' should be set.
     *                               If from existing file, 'id' should be set.
     */
    public function __construct( $properties ) {

        // Copy over any properties which were passed into construction.
        $this->properties = $properties;

        // If the dataset has a 'id' property, that means it already exists
        // in our system and we can construct the object from its file.
        if ( isset($this->properties['id']) ) {
            $this->from_file();
        }

        // If the dataset has a 'tmp_name' property, that mean
        // it was just uploaded and we can create it that way.
        else if ( isset($this->properties['tmp_name']) ) {
            $this->from_upload();
        }

        // If the dataset has a 'url' property, that means
        // it is to be created by grabbing the URL contents.
        else if ( isset($this->properties['url']) ) {
            $this->from_url();
        }
    }

    /**
     * Validate the dataset. This means making sure it is of the correct filetype,
     * making sure it is a valid instance of that filetype, and then converting
     * to JSON.
     *
     * Any warnings or error that occur are added to the notifications object
     * which is passed in. Objects are passed by reference in PHP, so if we
     * add them here they will stay where they need to be.
     *
     * FIXME: Data is not currently validated according to our spec.
     */
    public function validate($notifier) {

        // The methods in VisualBudget_Validator are all static,
        // but we can create an object anyway.
        $v = new VisualBudget_Validator();

        if ( isset($this->original_blob) ) {

            // FIXME: For now we assume the file is CSV.
            $csv = $this->original_blob;
            $this->data = array_map("str_getcsv", explode("\n", $csv));

            // Everything worked, so set the meta properties.
            $this->set_meta_properties();

        } else if ( isset($this->data) ) {
            // This has been a validation of an existing dataset.
            return 1;
        } else {
            // FIXME: Perhaps this should throw an exception.
            //        However, it should never happen.
            return 0;
        }

        return 1;
    }

    /**
     * Create a dataset from an existing file.
     */
    public function from_file() {
        $id = $this->properties['id'];

        // FIXME: How to use $wp_filesystem here?
        $meta = file_get_contents(VISUALBUDGET_UPLOAD_PATH . $id . '_meta.json');
        $this->properties = json_decode($meta, true);

        // JSON data.
        $json = file_get_contents($this->get_filepath()); // FIXME: Same.
        $this->data = json_decode($json);
    }

    /**
     * Create a dataset from an uploaded file.
     */
    public function from_upload() {

        // Read the file.
        $contents = file_get_contents($this->properties['tmp_name']);

        // Make sure the contents aren't empty.
        if ( !empty($contents) ) {
            // Store the contents.
            $this->original_blob = $contents;
        } else {
            // FIXME: Should this be an error?
            // The file may be empty, or maybe it didn't exist.
        }
    }

    /**
     * Create a dataset from a given URL.
     */
    public function from_url() {
        $url = $this->properties['url'];
        $response = wp_remote_request($url);

        // Check to see if the request worked.
        if ( is_wp_error($response) ) {
            // FIXME: Something went wrong.
        } else {
            // The retrieval was successful.
            // Check to see if there were errors on the other ense
            // by looking at the response code.
            if ( $response['response']['code'] == 200 ) {

                // Everything looks good, so grab the body of the result.
                $this->original_blob = $response['body'];

                // Now add the original name of the uploaded file, per the URL.
                $this->properties['uploaded_name'] = basename($url);

                // FIXME: Maybe we want to look at the content-type?
                // $response['headers']['content-type']

            } else {
                // FIXME: There was an error on the other end.
            }
        }
    }

    /**
     * Set the meta properties. This function is called automatically
     * at the end of a successful validation.
     */
    public function set_meta_properties() {

        // We don't want to do this twice!
        if ( !isset($this->properties['id']) ) {

            // The (UNIX) time of creation
            $this->properties['created'] = time();

            // The same as 'created', for now
            $this->properties['id'] = $this->properties['created'];

            // The filename, since it needs one
            // (But don't create the file itself yet)
            $this->properties['filename'] = $this->properties['created'] . '_data.json';

            // The meta filename
            $this->properties['meta_filename'] = $this->properties['created'] . '_meta.json';

            // What is the original extension?
            if ( isset($this->properties['uploaded_name']) ) {
                $pathinfo = pathinfo($this->properties['uploaded_name']);
                $this->properties['original_extension'] = $pathinfo['extension'];
            }

            // The original filename
            $this->properties['original_filename'] =
                $this->properties['created'] . '_orig.' . $this->properties['original_extension'];
        }

    }

     /**
      * Query the dataset á la the API.
      * @param   String   $qlevels      A string of levels to filter by.
      *                                 Case-insensitive.
      * @param   String   $timepoints   Optional. A date or date range.
      * @param   String   $filters      Optional. Metadata filters.
      *
      * @return    Either a single number or an array of numbers.
      *            Subtotals are calculated automatically.
      *
      * @example   query("Schools:Utilities:Water", "2012-2015")
      */
    public function query($qlevels, $timepoints_str, $filters_str) {
        // FIXME: $timepoints is currently ignored.
        // FIXME: $filters is currently ignored.
        // FIXME: Do error checking and validation on these inputs.
        //        What should happen if someone tries to break it?
        //        Maybe display "Badly formed Visual Budget request."

        // Split the dataset into the header row and the rest of the sheet
        $header = $this->data[0];                  // Just the first row
        $data = self::infer_levels($this->data);   // Get the inferred data
        $data = array_slice($data, 1);             // Ignore the header row

        // Get an array of the LEVEL column titles, ordered properly
        // and with the correct indices (i.e. indices referring to
        // the levels of the original dataset). See function for details.
        $ordered_levels = self::ordered_columns_of_type($header, 1);
        $ordered_levels_indices = array_keys($ordered_levels);

        // This is a safeguard against arrays whose keys have been
        // tampered with. We want an array with numeric keys 0--N.
        $qlevels = array_values($qlevels);

        // Now slice the array, getting only the relevant pieces.
        $slice = array_filter($data,
                        function ($row) use ($qlevels, $ordered_levels_indices) {
                            // Loop through each level, checking to see if
                            // each level matches. If not, return false
                            // immediately.
                            foreach ($qlevels as $n => $qlevel) {
                                // Compare the queried level against the one of this row
                                if ( strcasecmp($row[$ordered_levels_indices[$n]],
                                                 $qlevels[$n]) ) {
                                    // This means the row doesn't match, so return false.
                                    return false;
                                }
                            }
                            // Made it through all of them, so it looks like
                            // this row matches the levels.
                            return true;
                        });

        // FIXME: Should the $header be array_unshift'd
        //back onto the front here?
        return $slice;
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
        return array_map( Array('VisualBudget_Dataset','categorize_column'),
                    $header_row );
    }

    /**
     * Determines if a string is the title of a LEVEL column,
     * a timepoint column, or a metadata column.
     * Returns 1 for LEVEL, 0 for timepoint, -1 for metadata.
     *
     * @param  String  $string  The title of a dataset column.
     */
    public static function categorize_column($string) {
        if (preg_match('/^LEVEL[0-9]+$/i', $string)) {
            return 1;  // level
        } elseif (strtotime($string) !== false) {
            return 0;  // timepoint
        } else {
            return -1; // metadata
        }
    }

    /**
     * Return a dataset equivalent to the input,
     * but with inferred levels filled in.
     */
    public static function infer_levels($data) {

        // Split the dataset into the header row and the rest of the sheet
        $header = $data[0];            // Just the first row
        $data = array_slice($data, 1); // Everything but the first row

        // Get an array of the LEVEL column titles, ordered properly
        // and with the correct indices (i.e. indices referring to
        // the levels of the original dataset). See function for details.
        $ordered_levels = self::ordered_columns_of_type($header, 1);

        // Now loop through and fill in the blanks
        foreach ($data as $m => $row) {

            // Skip the first row. There is nothing to infer from.
            if ($m === 0) {
                continue;
            }

            // $flag is set to true whenever inferences are (or seem to be) complete.
            $flag = false;

            // Loop through the level columns on each row, inferring as necessary.
            foreach ($ordered_levels as $n => $level_name) {

                // If this element is empty, it means we should infer.
                if ($row[$n] == "") { // FIXME: Test for false or null?

                    // If no flag, then all's well.
                    if (!$flag) {

                        // Infer the value from the row above.
                        $data[$m][$n] = $data[$m-1][$n];

                    } else {
                        // This is a problem. It means that levels are being
                        // inferred between other levels.
                        // FIXME: add a warning for malformed dataset.
                    }
                } else {
                    // $flag == true indicates that we have stopped inferring.
                    // If there are any further inferences, we have a problem.
                    $flag = true;
                }
            }
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
     *           the returned array [4,7,..] would mean that LEVEL1 is column 4,
     *           LEVEL2 is column 7, etc.
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
     * Get the JSON of metadata to be written to the _meta JSON file.
     * Returns only the data of whitelisted $properties of
     * this object.
     */
    public function get_meta_json() {
        // Don't write all the meta properties to the meta file.
        // These are the ones to keep.
        $keep = Array(
                'id',
                'created',
                'filename',
                'meta_filename',
                'original_filename',
                'uploaded_name',
                'original_extension',
                'url'
                );

        // Filter out every key not in $keep.
        $props = array_filter( $this->properties,
                    function ($key) use ($keep) {
                        return in_array($key, $keep);
                    },
                    ARRAY_FILTER_USE_KEY );

        // Return encoded JSON.
        return json_encode($props);
    }

    // Get the JSON representation of this dataset.
    public function get_json() {
        return json_encode($this->data);
    }

    // Get the original blob of this dataset, if it exists.
    public function get_original_blob() {
        return $this->original_blob;
    }

    // Get the filename of this dataset.
    public function get_filename() {
        return $this->properties['filename'];
    }

    // Get the filename of this metadata to this dataset.
    public function get_meta_filename() {
        return $this->properties['meta_filename'];
    }

    // Get the filename of the original version of this dataset.
    public function get_original_filename() {
        return $this->properties['original_filename'];
    }

    // Get the file path of this dataset.
    public function get_filepath() {
        return VISUALBUDGET_UPLOAD_PATH . $this->properties['filename'];
    }

    // Get the file path of this metadata to this dataset.
    public function get_meta_filepath() {
        return VISUALBUDGET_UPLOAD_PATH . $this->properties['meta_filename'];
    }

    // Get the file path of the original version of this dataset.
    public function get_original_filepath() {
        return VISUALBUDGET_UPLOAD_PATH . $this->properties['original_filename'];
    }

    // Vertical dimension of the dataset
    public function num_rows() {
        return count($this->data);
    }

    // Horizontal dimension of the dataset
    public function num_cols() {
        return count($this->data[0]);
    }

    // Return the top-left corner of this dataset,
    // keeping only $rows rows and $cols columns.
    public function corner($rows = 4, $cols = 5) {
        $corner = array_slice(
                array_map(function($i) use ($cols) {
                    return array_slice($i, 0, $cols);
                }, $this->data),
            0, $rows);
        return $corner;
    }

    // Get the properties of the dataset
    public function get_properties() {
        return $this->properties;
    }

    public function get_notifications() {
        return $this->notifications;
    }

}
