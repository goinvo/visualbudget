<?php

header("Content-type: text/html");

?><!DOCTYPE html>
<html>
<head>
<link rel='stylesheet' type='text/css' href='vb.css'>
<script type='text/javascript' src='https://cdnjs.cloudflare.com/ajax/libs/d3/4.2.6/d3.min.js'></script>
<script type='text/javascript' src='https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.1/jquery.min.js'></script>
<script type='text/javascript' src='vb.js'></script>
<script type='text/javascript'>
$(document).ready(function(){
    vb.initialize();
});
</script>
</head>
<body><?php
echo $chart_div;
?></body>
</html>