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
     * The contents of the original (uploaded to gotten from URL) dataset
     */
    private $original_blob;

    /**
     * The contents of the original (uploaded to gotten from URL) dataset
     */
    private $json;

    /**
     * A flag, false by default. Set to true when date of creation, filename, etc,
     * have been established and set.
     */
    private $has_meta_properties;

    /**
     * Initialize the class and set its properties.
     * @param  array  $properties    An array of properties, which may include:
     *                                   tmp_name
     *                                   uploaded_name
     *                                   uploaded_size
     *                                   uploaded_type
     */
    public function __construct( $properties ) {

        // Set the flag to false.
        $this->has_meta_properties = 0;

        // Copy over any properties which were passed into construction.
        $this->properties = $properties;

        // If the dataset has a 'filename' property, that means
        // it already exits and we can construct the object that way.
        if ( isset($this->properties['filename']) ) {
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
                        $array = array_map("str_getcsv", explode("\n", $csv));
                        $this->json = json_encode($array);
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

        } else if ( !isset($this->json) ) {
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
        // FIXME: To do.
    }

    // Create a dataset from an upload
    public function from_upload() {
        // Store the contents of the uploaded file in this object
        $this->original_blob = file_get_contents($this->properties['tmp_name']);

        // And set the original name
        $this->properties['original_name'] = $this->properties['uploaded_name'];
    }

    // Create a dataset from a given URL
    public function from_url() {
        // FIXME: To do.
    }

    // Set the meta properties. This function is called after validation.
    public function set_meta_properties() {

        // We don't want to do this twice!
        if ( !$this->has_meta_properties ) {

            // The (UNIX) time of creation
            $this->properties['created'] = time();

            // Create the filename, since it needs one
            // (But don't create the file itself yet)
            $this->properties['filename'] = $this->properties['created'] . '_data.json';

            // Create the meta filename
            $this->properties['meta_filename'] = $this->properties['created'] . '_meta.json';

            // What is the original extension?
            if ( isset($this->properties['uploaded_name']) ) {
                $pathinfo = pathinfo($this->properties['uploaded_name']);
                $this->properties['original_extension'] = $pathinfo['extension'];
            }

            // Create the original filename
            $this->properties['original_filename'] =
                $this->properties['created'] . '_original.' . $this->properties['original_extension'];

            $this->properties['filepath'] =
                VISUALBUDGET_UPLOAD_PATH . $this->properties['filename'];

            $this->properties['meta_filepath'] =
                VISUALBUDGET_UPLOAD_PATH . $this->properties['meta_filename'];

            $this->properties['original_filepath'] =
                VISUALBUDGET_UPLOAD_PATH . $this->properties['original_filename'];

            // FIXME: To add: "size" (rows * cols)
            // and maybe "preview" for the corner of the spreadsheet

            $this->has_meta_properties = 1;
        }

    }

    // Get the JSON representation of this dataset.
    public function get_json() {
        return $this->json;
    }

    public function get_meta_json() {
        // Don't write all the meta properties to the meta file.
        // These are the ones to keep.
        $keep = Array(
                'created',
                'filename',
                'meta_filename',
                'original_filename',
                'uploaded_name',
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

    // Get the original blob of this dataset, if it exists.
    public function get_original_blob() {
        return $this->original_blob;
    }

    // Get the file path of this dataset.
    public function get_filepath() {
        return $this->properties['filepath'];
    }

    // Get the file path of this dataset.
    public function get_meta_filepath() {
        return $this->properties['meta_filepath'];
    }

    // Get the file path of the original version of this dataset.
    public function get_original_filepath() {
        return $this->properties['original_filepath'];
    }

}
