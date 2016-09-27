<?php
/**
 * Class for working with dataset files. This class is used by the filemanager,
 * and is not responsible for editing or otherwise touching files. It is simply
 * a data structure for information about each file.
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
     * The contents of the original (uploaded or gotten from URL) dataset.

     */
    private $original_blob;

    /**
     * The actual data, represented as PHP array.
     */
    private $data;

    /**
     * Initialize the class and set its properties.
     * @param  array  $properties    An array of properties, which may include:
     *                                   tmp_name
     *                                   uploaded_name
     *                                   uploaded_size
     *                                   uploaded_type
     */
    public function __construct( $properties ) {

        // Copy over any properties which were passed into construction.
        $this->properties = $properties;

        // If the dataset has a 'id' property, that means
        // it already exits and we can construct the object that way.
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
     */
    public function validate() {
        if ( isset($this->original_blob) ) {

            // If the file was uploaded then we already know the type.
            if ( isset($this->properties['uploaded_type']) ) {
                switch ( $this->properties['uploaded_type'] ) {
                    case 'text/csv':
                        $csv = $this->original_blob;
                        $this->data = array_map("str_getcsv", explode("\n", $csv));
                        break;

                    default:
                        // FIXME: Throw an exception for bad filetype?
                        return 0;
                }

            // This means the dataset is being drawn from a URL
            } else {
                // FIXME: To do.
                return 0;
            }

        } else if ( !isset($this->data) ) {
            // FIXME: Perhaps this should throw an exception
            return 0;
        }

        // Everything worked, so set the meta properties
        // and then return 1.
        $this->set_meta_properties();
        return 1;
    }


    // Create a dataset from an existing file
    public function from_file() {
        $id = $this->properties['id'];

        // FIXME: How to use $wp_filesystem here?
        $meta = file_get_contents(VISUALBUDGET_UPLOAD_PATH . $id . '_meta.json');
        $this->properties = json_decode($meta, true);

        // JSON data.
        $json = file_get_contents($this->get_filepath()); // FIXME: Same.
        $this->data = json_decode($json);
    }

    // Create a dataset from an upload
    public function from_upload() {
        // Store the contents of the uploaded file in this object
        $this->original_blob = file_get_contents($this->properties['tmp_name']);

        // And set the original name
        $this->properties['original_filename'] = $this->properties['uploaded_name'];
    }

    // Create a dataset from a given URL
    public function from_url() {
        // FIXME: To do.
    }


    // Set the meta properties. This function is called after validation.
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
      * @param   String   $levels       A string of levels to filter by.
      *                                 Case-insensitive.
      * @param   String   $timepoints   Optional. A date or date range.
      * @param   String   $filters      Optional. Metadata filters.
      *
      * @example   query("Schools:Utilities:Water", "2012-2015")
      * @return    Either a single number or an array of numbers.
      *            Subtotals are calculated automatically.
      */
    public function query($levels, $timepoints_str, $filters_str) {
        // FIXME: $timepoints is currently ignored.
        // FIXME: $filters is currently ignored.
        // FIXME: Do error checking and validation on these inputs.
        //        What should happen if someone tries to break it?
        //        Maybe display "Badly formed Visual Budget request."

        // Parse the timepoints (FIXME, doesn't do anything yet).
        $timepoints = self::parse_timepoints_query($timepoints_str);

        // Split the dataset into the header row and the rest of the sheet
        $header = $this->data[0];            // Just the first row
        $data = array_slice($this->data, 1); // Everything but the first row
        $data = self::infer_levels($data);   // Fill in empty level entries

        // Categorize the columns
        $categories = self::column_categories($header);

        // Now slice the array, getting only the relevant pieces.
        $slice = array_filter($this->data,
                        function ($row) use ($levels) {

                        });
    }


    /**
     * Parse the timpoints query. Takes a string, returns an Array.
     */
    public static function parse_timepoints_query($timepoints_str) {
        return $timepoints_str;
    }

    // Returns an array the same size as $header_row containing
    // the categories of each element of $header_row as determined
    // by the categorize_column() function.
    public static function column_categories($header_row) {
        return array_map(Array('VisualBudget_Dataset','categorize_column'), $header_row);
    }

    // Determines if a string is the title of a LEVEL column,
    // a timepoint column, or a metadata column.
    // Returns 1 for LEVEL, 0 for timepoint, -1 for metadata
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

        // Categorize the columns
        $categories = self::column_categories($header);

        // Filter out non-LEVEL columns. This gets us indices of all LEVEL cols.
        $levels = array_filter($categories, function($i) { return $i === 1; });
        $levels = array_keys($levels);

        // This is what we're after: the indices of the columns of levels,
        // in ascending order. E.g. [4,7,..] means LEVEL1 is column 4,
        // LEVEL2 is column 7, etc.
        $ordered_levels = array_filter($header,
            function($i) use ($levels) {
                return in_array($i, $levels);
            }, ARRAY_FILTER_USE_KEY);
        natcasesort($ordered_levels);

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

    // Get the file path of this dataset.
    public function get_filepath() {
        return VISUALBUDGET_UPLOAD_PATH . $this->properties['filename'];
    }

    // Get the file path of this dataset.
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

    // A preview of the dataset
    public function corner() {
        $rows = 4;
        $cols = 5;
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



}
