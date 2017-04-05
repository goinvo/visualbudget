<?php

/**
 * Class for representing datasets. This class is used by many other classes.
 * This class does not write to the filesystem.
 */
class VisualBudget_Dataset {

    /**
     * This is a reference to the admin's notifier object.
     */
    private $notifier;

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
     * FIXME: Whether or not this property is set is used as a check
     * for whether the dataset is being uploaded. That seems inelegant
     * and perhaps should change.
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
    public function __construct($notifier) {

        // The notifier is used to display notices, errors, and warnings
        // to the dashboard.
        $this->notifier = $notifier;

        // Create the properties array.
        $this->properties = array();
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
    public function validate() {

        // If $this->original_blob is set, that means
        // the dataset is being created right now.
        // It needs to be validated and normalized.
        if ( isset($this->original_blob) ) {

            // Create a new validator object.
            $v = new VisualBudget_Validator($this->notifier);

            // Get the filetype and the blob, and try to validate it.
            $filetype = $this->properties['uploaded_extension'];
            $data_string = $this->original_blob;
            $result = $v->validate($data_string, $filetype);

            // Check to see if the validation worked.
            if ( ! $result ) {
                // Something went wrong.
                // Any errors have already been logged by the validator.
                return 0;

            } else {
                // It worked, so store the data and set meta properties.
                $this->data = $result;
                $this->set_meta_properties();
                return 1;
            }

        } else if ( isset($this->data) ) {
            // This has been a validation of an existing dataset,
            // so there is nothing to do.
            return 1;

        } else {
            // The logic flow will reach this point only if there was
            // previously an error in either from_url, from_file, or
            // from_upload. In such a case, the notifier has already
            // been updated with a new error notice. So here we just
            // return false.
            return 0;
        }
    }

    /**
     * Create a dataset from an existing file.
     */
    public function from_file($id) {

        // FIXME: How to use $wp_filesystem here?
        $meta = file_get_contents(VISUALBUDGET_UPLOAD_PATH . $id . '_meta.json');
        $this->properties = json_decode($meta, true);

        // Set the data.
        $this->data = array_map('str_getcsv', file($this->get_filepath('csv')));
    }

    /**
     * Create a dataset from an uploaded file.
     */
    public function from_upload($tmp_name, $uploaded_name) {

        // Read the file.
        $contents = file_get_contents($tmp_name);

        // Make sure the contents aren't empty.
        if ( !empty($contents) ) {
            // Store the contents.
            $this->original_blob = $contents;

            // Add the uploaded filename to properties.
            $this->properties['uploaded_name'] = $uploaded_name;

            // And the file extension, used for checking filetype
            // (MIME type is not always reliable).
            $pathinfo = pathinfo($this->properties['uploaded_name']);
            $this->properties['uploaded_extension'] = $pathinfo['extension'];

        } else {

            // The user tried to upload an empty file.
            $this->notifier->add('The uploaded file was empty.', 'error', 100);
        }
    }

    /**
     * Create a dataset from a given URL.
     */
    public function from_url($url) {

        // Try to fetch the external file.
        $response = wp_remote_request($url);

        // Check to see if the request worked.
        if ( is_wp_error($response) ) {

            // Something went wrong in WordPress. Post the error to the admin.
            $this->notifier->add($response->get_error_message(), 'error');

        } else {

            // The retrieval was successful.
            // Check to see if there were errors on the other ense
            // by looking at the response code.
            if ( $response['response']['code'] == 200 ) {

                // Everything looks good, so grab the body of the result.
                $this->original_blob = $response['body'];

                // Now add the original name of the uploaded file, per the URL.
                $this->properties['uploaded_name'] = basename($url);

                // And the file extension, used for checking filetype
                // (MIME type is not always reliable).
                $pathinfo = pathinfo($this->properties['uploaded_name']);
                $this->properties['uploaded_extension'] = $pathinfo['extension'];

                // Add the url too
                $this->properties['url'] = $url;

            } else {

                // There was a problem on the other end.
                $this->notifier->add('There was an error with the remote server, '
                                . 'so the data file cannot be fetched from URL. '
                                . 'Perhaps the file does not exist, or perhaps the '
                                . 'server is down.', 'error', 101);
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

            // The filename for the deep JSON
            $this->properties['filename_csv'] = $this->properties['id'] . '.csv';

            // The filename for the flat JSON
            $this->properties['filename_json'] = $this->properties['id'] . '.json';

            // The meta filename
            $this->properties['filename_meta'] = $this->properties['id'] . '_meta.json';

            // What is the original extension?
            if ( isset($this->properties['uploaded_name']) ) {
                $pathinfo = pathinfo($this->properties['uploaded_name']);
                $this->properties['uploaded_extension'] = $pathinfo['extension'];
            }

            // The original filename
            $this->properties['filename_original'] =
                $this->properties['id'] . '_orig.' . $this->properties['uploaded_extension'];

        }

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
                'filename_json',
                'filename_csv',
                'filename_meta',
                'filename_original',
                'uploaded_name',
                'uploaded_extension',
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

    // Get the data.
    public function get_data($format='array') {
        switch($format) {
            case 'array':
                return $this->data;
                break;

            case 'json':
                $name = strval($this->properties['id']);
                $restructured_data = VisualBudget_Dataset_Restructure::restructure($this->data, $name);
                return json_encode($restructured_data);
                break;

            case 'csv':
                return $this->array2d_to_csv($this->data);
                break;

            default:
                return $this->data;
        }
    }


    // Get the original blob of this dataset, if it exists.
    public function get_original_blob() {
        return $this->original_blob;
    }

    // Get the filename of this dataset.
    public function get_filename($string='json') {
        switch($string) {
            case 'json':
                return $this->properties['filename_json'];
                break;

            case 'csv':
                return $this->properties['filename_csv'];
                break;

            case 'meta':
                return $this->properties['filename_meta'];
                break;

            case 'original':
                return $this->properties['filename_original'];
                break;

            default:
                return null;
        }
    }

    // Get the file path of this dataset.
    public function get_filepath($string) {
        return VISUALBUDGET_UPLOAD_PATH . $this->get_filename($string);
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

    /**
     * Turn an array into a CSV string.
     *
     * This function based on code from
     * https://gist.github.com/johanmeiring/2894568
     */
    public function array2d_to_csv($matrix, $delimiter = ',', $enclosure = '"') {
        $csv = '';

        foreach ($matrix as $row) {
            // Open a memory "file" for read/write...
            $fp = fopen('php://temp', 'r+');
            // ... write the $row array to the "file" using fputcsv()...
            fputcsv($fp, $row, $delimiter, $enclosure);
            // ... rewind the "file" so we can read what we just wrote...
            rewind($fp);
            // ... read the entire line into a variable...
            $data = rtrim(stream_get_contents($fp), "\n");
            // ... close the "file"...
            fclose($fp);
            // ... and return the $data to the caller, with the trailing newline from fgets() removed.
            $csv .= $data . "\n";
        }

        return rtrim($csv, "\n");
    }

}
