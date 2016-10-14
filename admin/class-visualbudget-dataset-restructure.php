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

    public function __construct() {
    }

    /**
     * Turn the flat spreadsheet structure into a tree structure,
     * and add up all subtotals. Note that an array must be validated
     * before being restructured; it must, for example, have LEVELs all inferred.
     *
     * @param   array   $data_array   2-dimensional array, direct translation of CSV
     */
    public static function restructure($data_array, $title='dataset_title') {

        $tree = self::generate_tree($data_array, $title);
        $tree = self::sum_tree($tree);

        return $tree;

    }

    /**
     * Turn the flat spreadsheet structure into a tree structure.
     *
     * @param   array   $data_array   2-dimensional array, direct translation of CSV
     */
    public static function generate_tree($data_array, $title) {

        // FIXME: Is this require necessary?
        require_once 'class-visualbudget-validator.php';

        $header = $data_array[0];            // Just the first row
        $data = array_slice($data_array, 1); // Everything but the first row

        // Let's just do this once.
        $ordered_column_categories = array(
               -1 => VisualBudget_Validator::ordered_columns_of_type($header, -1),
                0 => VisualBudget_Validator::ordered_columns_of_type($header,  0),
                1 => VisualBudget_Validator::ordered_columns_of_type($header,  1)
            );

        // The restructured tree.
        // The highest-level node is a leaf whose name is the dataset title.
        $tree = self::create_bare_leaf($title);

        // Loop through and add each row as a leaf to the tree.
        foreach ($data as $m => $row) {

            // These are the LEVEL names, hierarchically ordered in an array.
            $level_names = array_map(function($index) use ($row) {
                                        return $row[$index];
                                    },
                                    array_keys($ordered_column_categories[1]));

            // This filters out all empty names.
            $level_names = array_filter($level_names);

            // We don't need the last name, which is the name of the leaf itself.
            array_pop($level_names);

            // Create the new leaf.
            $new_leaf = self::create_leaf($row, $ordered_column_categories);

            // Add the new leaf to the tree.
            self::insert_into($tree, $level_names, $new_leaf);
        }

        return $tree;
    }

    /**
     * Create a new leaf.
     */
    public static function create_leaf($row, $ordered_column_categories) {

        // Create a new array for the leaf.
        $leaf = array();

        // The last defined LEVEL is the "name" of the leaf.
        $level_indices = array_keys($ordered_column_categories[1]);
        $index = count($level_indices);
        while(empty($leaf['name'])) {
            $leaf['name'] = $row[ $level_indices[--$index] ];
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
     * Create a leaf whose only nonempty property is its name.
     */
    public static function create_bare_leaf($name) {
        $leaf = self::create_leaf(array($name), array( 1 => array(0=>'LEVEL1'),
                                                        0 => array(),
                                                       -1 => array() ));
        return $leaf;
    }

    /**
     * Given a multidimensional array and a list of names,
     * insert a new item into it at arbitrary depth.
     *
     * $tree is a tree (multidimensional array).
     * $names is an array of names of children; the name of the root
     *      node of $tree is not included, nor is the name of $leaf.
     * $leaf is the leaf to append to the node
     *      $tree->$names[0]->...->$names[n].
     */
    public static function insert_into(&$tree, array $names, $leaf) {

        // Dive into the tree one dimension at a time, eventually
        // setting the appropriate value.
        foreach($names as $k => $name) {

            // First look for the child named $name.
            // Create it if it doesn't exist yet.
            if( empty(array_filter($tree['children'],
                    function($a) use ($name) { return $a['name'] == $name; } )) ) {
                array_push($tree['children'], self::create_bare_leaf($name));
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

        if ( empty($tree['children']) ) {
            // Do nothing. This is a leaf, so nothing to sum. Base case.

        } else {
            // We will create an array of sums.
            $dollars_sum = array();

            // Sum up the dollars amounts in each child tree.
            foreach ($tree['children'] as &$child) {
                $child = self::sum_tree($child); // Recurse.
                $dollars_sum = self::add_dollar_amounts($dollars_sum, $child['dollarAmounts']);
            }
            unset($child);

            $tree['dollarAmounts'] = $dollars_sum;
        }

        return $tree;
    }

    /**
     * Compute the sum of two dollarAmounts fields in data.
     * A dollarAmounts array is structured as
     *
     *   $tree['dollarAmounts'] = array(
     *                                array(
     *                                    'date' => 2002,
     *                                    'dollarAmount' => 89232.31
     *                                ),
     *                                array(
     *                                    'date' => 2003,
     *                                    'dollarAmount' => 42442.79
     *                                ),
     *                                ...
     *                            )
     */
    public static function add_dollar_amounts($array1, $array2) {
        // Loop through, adding the dollar amounts of $array1 to those
        // of $array2. The data structure is a bit weird here, which is
        // why this function is necessary at all.
        foreach($array2 as $elem) {
            $date = $elem['date'];
            $index = array_keys(array_filter($array1,
                        function($a) use ($date) { return $a['date'] == $date; } ));

            // If index is nonempty, it means $array1 & $array2 both contain that date.
            if (!empty($index)) {
                $index = $index[0]; // $index is actually an array.
                $array1[$index]['dollarAmount'] += $elem['dollarAmount'];
            } else {
                array_push($array1, $elem);
            }
        }

        return $array1;
    }

}