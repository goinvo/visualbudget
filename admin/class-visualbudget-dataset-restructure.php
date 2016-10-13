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
            $level_names = 
            $new_leaf = create_leaf($row, $ordered_column_categories);
            insert_into($tree, $level_names, $leaf);
        }

        return $tree;
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

        // No children.
        $leaf['children'] = array();

        return $leaf;
    }

    /**
     * Given a multidimensional array and a list of names,
     * insert a new item into it at arbitrary depth.
     *
     * This function is loosely based on code from
     * http://stackoverflow.com/a/2447631/1516307
     */
    public static function insert_into(&$tree, array $names, $leaf) {
        // We simply don't do anything with the last name.
        // It is the name of the leaf, which was already created.
        $last = array_pop($names);

        // Dive into the tree one dimension at a time, eventually
        // setting the appropriate value.
        foreach($names as $name) {

            // Create the "name" property if necessary.
            if( empty($tree['name']) ) {
                $tree['name'] = $name;
            }

            // Create the "children" property if necessary.
            if( empty($tree['children']) ) {
                $tree['children'] = array();
            }

            // Create the "meta" property if necessary.
            if( empty($tree['meta']) ) {
                $tree['meta'] = array();
            }

            // Check to see if the next child exists; create it if not.
            if( empty(array_filter($tree['children'],
                    function($a) use ($name) { return $a['name'] == $name; } )) ) {
                array_push($tree['children'], array('name' => $name));
            }

            // Now find the right child and set the pointer to it.
            $index = array_keys(array_filter($tree['children'],
                        function($a) use ($name) { return $a['name'] == $name; } ));

            $tree = &$tree['children'][$index[0]];
        }

        // Now add the leaf to the tree.
        array_push($tree['children'], $leaf);
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