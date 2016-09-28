<?php

/**
 * Visualization page, using the API specified in the Github wiki.
 */

// $text = (isset($_GET['text'])) ? $_GET['text'] : '';
// echo "<p>I, the vis, say '" . $text . "'.</p>";

header("Content-type: text/html");
?><!DOCTYPE html>
<html>
<head>
<script type='text/javascript' src='https://cdnjs.cloudflare.com/ajax/libs/d3/4.2.6/d3.min.js'></script>
<script type='text/javascript' src='https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.1/jquery.min.js'></script>
<script type='text/javascript'><?php
    require_once 'includes/class-visualbudget.php';
    require_once 'admin/class-visualbudget-dataset.php';
    // VisualBudget::define_constants();
    if (isset($_GET['data'])) {
        // FIXME: do validation here. What if the ID is not an ID?
        $qdata = explode(':', $_GET['data']);
        $id = $qdata[0];
        array_shift($qdata);
        // $dataset = new VisualBudget_Dataset(array('id'=>$id));

        // if ($dataset->is_valid()) {
        //     $json = json_encode( $dataset->query($qdata) );
        //     echo "window._visualbudget_data=";
        //     print_r($json);
        //     echo ";";
        // } else {
        //     echo "null";
        //     $json = "Dataset not found.";
        // }
    } else {
        // FIXME:
        // If no "data" was specified, what to do?
    }
?>

$( document ).ready(function() {
    d3.json("api.php?dataset=<?php echo $id; ?>_data.json", function(data) {
        $('#data').html(data);
    });
});

</script>
</head>
<body>

<pre id='data'></pre>

</body>
</html>
