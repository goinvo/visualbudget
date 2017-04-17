Visual Budget 2.0 (VB2) is a tool for visualizing budget data. Data must conform to this specification in order to be properly parsed and displayed by VB2.

## File format

Each dataset is a two-dimensional table, i.e. a spreadsheet. Natively, VB2 deals with spreadsheets serialized in JavaScript Object Notation (JSON) as described below; however, VB2 includes tools for automatic validation and conversion of comma-separated values (CSV) files to JSON. VB2 also accepts JSON in the format used by Visual Budget 1.0.

During intake, the datasets are normalized (e.g. stripped of empty rows and columns) and validated (e.g. coerced to numbers in columns which should have numbers). If anything goes wrong, appropriate error messages and warnings are displayed with suggested corrective action.

[//]: # (this is a comment, fyi)

## Spreadsheet structure

A standard dataset conforms to the following structure. The terminology is explained below. For examples of standard datasets, see the folder of test datasets.

| LEVEL1 | LEVEL2 |  …  | LEVEL\<N\> | \<TIMEPOINT\> |  …  | \<TIMEPOINT\> | \<METADATA\> |  …  | \<METADATA\> |
|:------:|:------:|:---:|:----------:|:-------------:|:---:|:-------------:|:------------:|:---:|:------------:|
| \<level\> | \<level\> | … | \<level\> | \<value\> | … | \<value\> | \<string\> | … | \<string\> |
| \<level\> | \<level\> | … | \<level\> | \<value\> | … | \<value\> | \<string\> | … | \<string\> |
| … | … | … | … | … | … | … | … | … | … |

### Terminology

**Timepoint**  
A period of time, titling a single column of budget data.  
*e.g. “2016” or “Q3 2016”*

**Metadata**  
Additional information about the line item. May be arbitrary.  
*e.g. “Source of funds”, “Tooltip”, or “Tags”*

At minimum, a standard dataset contains one level column and one timepoint column. There is no limit to the number of level columns, timepoint columns, or metadata columns. Empty columns will be ignored.

Field names (column titles) must be unique within a dataset. In a given dataset, all the intervals between timepoints must be the same. Calculated data can be derived only from datasets with the same time intervals.

The ordering of columns does not matter, and the ordering of rows only matters in the context of level inference, as explained in the next section.

**Level**  
The hierarchical identification of a line item, written as a string.  
*e.g. “Schools”, “Utilities”, or “Electricity”*

**Value**  
A currency amount or other numerical value associated with a timepoint. Values may be integers or floats, but without commas.  
*e.g. “12000” or “-19.2”*


## Metadata fields

### Recommended fields

| Field name | Purpose |
| ---------- | ------- |
| TOOLTIP    | To specify the string that will appear as a tooltip in visualizations |

## Other datasets

Nonfinancial datasets may also be uploaded and used in visualizations. One common nonstandard dataset used is demographics, with population data and other statistics.

In order for datasets to be compared in the same visualization, their timepoints must agree. Also, in order for individual categories to be selected, the “LEVEL\<N\>” syntax must be used. Therefore, even if there are no subcategories, the first column of a dataset should still be titled “LEVEL1”.

A demographics dataset may look like this:

| LEVEL1 | 2014 | 2015 | 2016 |
|:------:|:----:|:----:|:----:|
| Population | 15032 | 17984 | 22160 |
| Number of schools | 14 | 14 | 15 |
| Number of pupils | 3940 | 4025 | 4106 |

## Valid characters

Dataset names, levels, and metadata field names may only contain the following characters:

    letters             a–z A–Z
    digits              0–9
    underscore          _
    spaces

We recommend using underscores instead of spaces in names for clarity, but both will work.

## Inference

Because the spreadsheet structure produces redundancy, some of the entries are optional and can be inferred by VB2. Specifically, the inference rule is this:

> If there are undefined level fields in a particular line item X, then all levels n < m of X will be inferred from the line item above it, where m is the number of the lowest level defined in X. If no level fields are defined in X, then all level fields are inferred from the line item above it.

In the following example, the italicized levels may be omitted from the spreadsheet.

| LEVEL1 | LEVEL2 | LEVEL3 | 2015 |  2016  |
|:------:|:------:|:------:|:----:|:------:|
| Schools | Utilities | Water | 27320.55 | 31844.28 |
| *Schools* | *Utilities* | Internet | 12098.21 | 13465.10 |
| *Schools* | Administration | Salaries | 120051.22 | 144560.61 |
| *Schools* | *Administration* | Expenses | 74589.89 | 82164.46 |

## Subtotals

Subtotals are calculated automatically and should not be entered into the dataset. Subtotal records in legacy dataset files will be discarded (that is, any line item with “Total” or “Subtotal” in any level field will be discarded).
