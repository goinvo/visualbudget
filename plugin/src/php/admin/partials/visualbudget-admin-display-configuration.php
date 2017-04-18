<?php
/**
 * This file displays the content of the "Configuration" tab in the dashboard.
 */

$config = $this->config;

$selected = ' selected="SELECTED"';
$taxyear = $this->config['default_tax_year'];
$taxyear_cur = '';
$taxyear_next = '';
$fiscalstart = $this->config['fiscal_year_start'];
$fiscal_jan = '';
$fiscal_jul = '';
$fiscal_oct = '';
if($taxyear == "current") { $taxyear_cur = $selected; }
                     else { $taxyear_next = $selected; }
if     ($fiscalstart == "jan") { $fiscal_jan = $selected; }
else if($fiscalstart == "jul") { $fiscal_jul = $selected; }
                          else { $fiscal_oct = $selected; }
?>
<form method="post" action="<?php echo $_SERVER['REQUEST_URI']?>">

<table class="form-table">
<tr>
    <td scope="row">Average tax bill (whole number, in dollars)</td>
    <td>
        <input type="text" size="15" id="avg_tax_bill" name="visualbudget_tab_config[avg_tax_bill]" value="<?php echo $this->config['avg_tax_bill']; ?>" />
    </td>
</tr>
<tr>
    <td scope="row">Default tax year to display</td>
    <td>
        <select name="visualbudget_tab_config[default_tax_year]" id="default_tax_year">
        <option value="current"<?php echo $taxyear_cur; ?>>current year</option>
        <option value="next"<?php echo $taxyear_next; ?>>next year</option>
        </select>
    </td>
</tr>
<tr>
    <td scope="row">Fiscal year start</td>
    <td>
        <select name="visualbudget_tab_config[fiscal_year_start]" id="fiscal_year_start">
        <option value="jan"<?php echo $fiscal_jan; ?>>1 Jan</option>
        <option value="jul"<?php echo $fiscal_jul; ?>>1 July</option>
        <option value="oct"<?php echo $fiscal_oct; ?>>1 October</option>
        </select>
    </td>
</tr>
</table>

<input type='submit' name='visualbudget_submit_config' value='Update configuration'>

</form>
