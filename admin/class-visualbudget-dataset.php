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

    // Get the JSON representation of this dataset.
    public function get_json() {
        return json_encode($this->data);
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

}
