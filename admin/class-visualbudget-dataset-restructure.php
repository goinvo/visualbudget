<?php

/**
 * After a dataset has been validated, it is restructured
 * from a flat array to a tree before being encoded as JSON.
 *
 * Since data is always validated before being passed to
 * the restructuring, there should never be errors in this
 * part of the code.
 */
class VisualBudget_Dataset_Restructure {

    public function __construct($notifier) {
    }

    /**
     * Turn the flat spreadsheet structure into a tree structure,
     * and add up all subtotals. Note that an array must be validated
     * before being restructured; it must, for example, have LEVELs all inferred.
     *
     * @param   array   $data_array   2-dimensional array, direct translation of CSV
     */
    public static function restructure($data_array) {

        $tree = self::generate_tree($data_array);
        $tree = self::sum_tree($tree);

    }

    /**
     * Turn the flat spreadsheet structure into a tree structure.
     *
     * @param   array   $data_array   2-dimensional array, direct translation of CSV
     */
    public static function generate_tree($data_array) {

        require_once 'class-visualbudget-validator.php';

        $header = $data[0];            // Just the first row
        $data = array_slice($data, 1); // Everything but the first row

        // Let's just do this once.
        $ordered_column_categories = array(
               -1 => VisualBudget_Validator::ordered_columns_of_type($header, -1),
                0 => VisualBudget_Validator::ordered_columns_of_type($header,  0),
                1 => VisualBudget_Validator::ordered_columns_of_type($header,  1)
            );

        // The restructured tree
        $tree = array();

        // Loop through and add each row as a leaf to the tree.
        foreach ($data as $m => $row) {
            $tree = self::recursive_leaf_append($tree, $row, $ordered_column_categories);
        }

        return $tree;
    }

    /**
     * Recursive function to add a leaf to the tree. Given a $tree, returns
     * a new tree with the leaf represented by $row added.
     */
    public static function recursive_leaf_append($tree, $row, $ordered_column_categories) {

        // If there is only one ordered_level left or if the next LEVEL field is
        // empty, then that means we've hit the end of the line and we should
        // append a leaf.

        if (empty($row[$ordered_levels[1]])) {
            // Append the leaf.
            $tree =
        } else {

        }

        foreach ($ordered_levels as $i => $n) {
            // Check to see if $n is the highest LEVEL which is nonempty,
            // or if it is the maximum LEVEL number (both are achieved
            // with this one test).
            if (empty($data[$m][$ordered_levels[$n+1]])) {

            } else {
                // This is not a leaf of the tree. Just make sure the
                // node exists and has the right properties.
                $tree
            }
        }
    }

    /**
     * Create a new leaf.
     */
    public static function create_leaf($row, $ordered_column_categories) {
        $leaf = array();

        // The last defined LEVEL is the "name" of the leaf.
        $index = count($ordered_column_categories[1]);
        while(empty($leaf['name'])) {
            $leaf['name'] = $row[ $ordered_column_categories[1][--$index] ];
        }

        // Now add the "values" to the leaf.
        $leaf['dollarAmounts'] = array();
        foreach($ordered_column_categories[0] as $k => $date) {
            array_push($leaf['dollarAmounts'],
                    array('date' => $date,
                          'dollarAmount' => $row[$k]
                        )
                    );
        }

        // Now add the metadata values.
        $leaf['meta'] = array();
        foreach($ordered_column_categories[-1] as $k => $meta_name) {
            array_push($leaf['meta'],
                    array('name' => $meta_name,
                          'value' => $row[$k]
                        )
                    );
        }

        return $leaf;
    }

    /**
     * Calculate subtotals and save them to the tree.
     * This method will overwrite existing subtotals.
     *
     * @param   array   $tree   N-dimensional array, result of generate_tree()
     */
    public static function sum_tree($tree) {
    }

}