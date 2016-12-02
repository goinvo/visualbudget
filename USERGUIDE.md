# User guide

## Uploading datasets

Datasets should be formatted according to the Dataset Specification.
Improperly formatted datasets may cause errors or warnings during upload.
Some of the warnings are inconsequential, while others may indicate that
your dataset has been misinterpreted by Visual Budget.

This section contains a description of the proper way to format your
budget data for upload, along with possible errors and how to fix them.

### Budget Dataset Specification

[Copy content from the dataset specification on the wiki; or copy that file
here and refer/link to it.]

### Errors and warnings (and how to fix them)

This is list of all numbered errors and warnings that the system may return
upon dataset upload, along with what they mean and how to fix them.

(*Note: There are also a few unnumbered errors, which are errors that don't
have to do with the formatting of the dataset itself; for example, you will
get an error if you try to upload a dataset from a nonexistent URL.*)

- Error 100: The uploaded file was empty.

  [Occurs when files of size 0 bytes are uploaded.]

- Error 101: There was an error with the remote server, so the data
  file cannot be fetched from URL. Perhaps the file does not exist,
  or perhaps the server is down.
  
  [Occurs when the upload-by-URL call to external server returns
  an HTTP code other than 200.]

- Error 102: Uploaded file must have a file extension.
  Accepted filetypes are CSV and JSON.

  [Occurs when uploaded file has no extension.]

- Error 103: The file is not valid JSON.

  [Occurs when the uploaded file has extension .json but
  returns false when PHP calls json_decode on its contents.]

- Error 104: Unrecognized filetype {X}. Data files must be either
  CSV or JSON.

  [Occurs when a uploaded file has extension other than .csv or .json.]

- Warning 105: Not all rows of the uploaded dataset were the same length.
  Rows have been extended on the right to rectangularize the dataset.

  [Occurs when the CSV has rows of different lengths. It is a warning,
  so the dataset is still uploaded. Rows are padded out as necessary.]

- Warning 106: {N} header fields were found be empty.
  They have been named by the system.

  [Occurs when metadata columns are untitled. They are automatically
  named "UNKNOWN_FIELD_{N}" by the system.]

- Warning 107: Malformed dataset: Inference between LEVELs on rows {X,Y,Z}.
  Dataset may have been incorrectly inferred.

  [Occurs when inference is wonky but can still be filled in in some way.
  The behavior of this warning will probably change a bit, since right
  now "good" datasets sometimes return this warning.]

- Error 108: There must be at least one timepoint column. None were found.
  Note that syntax for timepoint column headers is strict: the fieldname
  must be machine-readable as a date. Try formats like "2012" or "2012-08".

  [Occurs when a dataset has no timepoint columns.]

- Error 109: There must be at least one LEVEL column. None were found.
  Note that syntax for LEVEL column headers is strict: the fieldname must
  be of the form LEVEL<N>, where <N> is an integer.

  [Occurs when a dataset has no LEVEL columns.]

- Warning 110: {N} rows identified as subtotal items have been removed
  from your dataset.

  [Occurs when subtotal rows are detected in the dataset. Subtotals are
  automatically removed.]

- Warning 111: {N} rows identified as duplicate items have been removed
  from your dataset.

  [Occurs when duplicate items are detected in the dataset. Duplicates
  are automatically removed.]
