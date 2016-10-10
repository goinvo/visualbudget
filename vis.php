<?php

/**
 * Visualization page, using the API specified in the Github wiki.
 */

header("Content-type: text/html");

// FIXME: Maybe add a $_GET['iframe'] variable -- if true,
// return an iframe. Otherwise return a div.
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

<?php /* FIXME: inject the data directly into a JS variable. */ ?>
$( document ).ready(function() {

    // var data = "";
    // var dsv = d3.dsvFormat(delimiter);
    // var parsed_data = dsv.parse(data);
    // d3.data(parsed_data);

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
