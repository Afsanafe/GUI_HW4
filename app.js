/*
File: app.js
Assignment: Dynamic Multiplication Table (Interactive Web App)
About: This webpage allows users to generate a fully dynamic and scrollable
multiplication table by entering custom row and column ranges. The page
includes input validation, smooth hover highlighting, and sticky headers
for improved readability and user experience.

Author: Afsa Nafe
Affiliation: UMass Lowell, Computer Science Department
Email: afsa_nafe@student.uml.edu
Copyright (c) 2025 by Afsa Nafe. 
All rights reserved. May be freely copied or excerpted for educational purposes 
with credit to the author.
Last updated by Afsa Nafe on October 26th, 2025 at 10:19 PM
*/

// Wait until the DOM is ready before running any code that queries elements.
// document.addEventListener("DOMContentLoaded", () => { 
// *New* jQuery version:
$(document).ready(function() {
    // Element references
    // No longer needed due to jquery : $("#table-form") // const form = document.getElementById("table-form"); // "table-form" is the intended element in HTML
    const clearBtn = document.getElementById("clearBtn");
    const tableHost = document.getElementById("tableHost");
    const errors = document.getElementById("errors");

    // ========= Part 1 ======= //
    // jQuery ($) will be used to select the form and call .validate()

    $("#table-form").validate({
        // 1. RULES : for each input
        rules: {
            hStart: {
                required: true,
                number: true,
                range: [-50, 50] // This one rule replaces the entire isNum AND inRange validation functions
            },
            hEnd: {
                required: true,
                number: true,
                range: [-50, 50]
            }, 
            vStart: {
                required:true,
                number: true,
                range: [-50, 50]
            },
            vEnd: {
                required: true,
                number: true,
                range: [-50, 50]
            }
        },

        // 2. Custom Messages : We can insert the custom error messages here to be precise
        messages: {
            hStart: {
                required: "The minimum row value is required.",
                number: "Must be a valid number.",
                range: "Please enter a value between -50 and 50." // This suggests to user how to correct and enter valid input
            },
            hEnd: {
                required: "The maximum row value is required.",
                number: "Must be a valid number.",
                range: "Please enter a value between -50 and 50."
            },
            vStart: {
                required: "The minimum column value is required.",
                number: "Must be a valid number.",
                range: "Please enter a value between -50 and 50."
            },
            vEnd: {
                required: "The maximum column value is required.",
                number: "Must be a valid number.",
                range: "Please enter a value between -50 and 50."
            }
        },

        // 3. Error Placement : This tells the plugin to not just stick the errors anywhere but inside my existing <div id='errors'>
        wrapper: "span", // Wraps each error in a <span> instead of a <label>

        // 4. The Submit Handler (Most important aspect) 
        // The plugin STOPS the form from submitting. And this *is the only code that will run After the for is proven valid*
        submitHandler: function(form) {
            // OLD Table Building

            // reset UI
            tableHost.innerHTML = "";
            errors.textContent = ""; // Clear errors on success

            // 1) Read values from inputs (they come in as strings) = read the numbers the user types into the input boxes on my form
            const hStart = parseInt($("#hStart").val(), 10);
            const hEnd = parseInt($("#hEnd").val(), 10);
            const vStart = parseInt($("#vStart").val(), 10);
            const vEnd = parseInt($("#vEnd").val(), 10);

            // 2) Normalize ranges (swap start/end if needed) while preserving original variables
            let hs = hStart, he = hEnd, vs = vStart, ve = vEnd;
            if (hs > he) [hs, he] = [he, hs];
            if (vs > ve) [vs, ve] = [ve, vs];

            // 3) Build table - Final "business logic" check for table size
            const cols = (he - hs + 1);
            const rows = (ve - vs + 1);
            const cells = rows * cols;
            const MAX_CELLS = 10000;

            if (cells > MAX_CELLS) {
                // Manually show an error in your div and stop
                errors.textContent = `Table too large (${cells} cells). Please reduce the range. Max is ${MAX_CELLS}`;
                return;
            }

            // 4) Build table: create elements in memory, then attach to DOM
            const table = document.createElement("table");
            const thead = document.createElement("thead");
            const headRow = document.createElement("tr");

            // top-left corner header
            const corner = document.createElement("th");
            corner.className = "corner"; // styled in CSS (e.g. stick)
            corner.textContent = "x";
            headRow.appendChild(corner);

            // horizontal header cells
            for (let x = hs; x<=he; x++) {
                const th = document.createElement("th");
                th.textContent = String(x);
                headRow.appendChild(th);
            }
            thead.appendChild(headRow);
            table.appendChild(thead);

            // tbody rows and cells
            // columns 1st being generated, 1st cell each row
            const tbody = document.createElement("tbody");

            for (let y = vs; y <= ve; y++) {
                const tr = document.createElement("tr");
                const rowTh = document.createElement("th"); // row header (left-most)
                rowTh.textContent = String(y);
                tr.appendChild(rowTh);
                
                // each cell in every row
                for (let x = hs; x<= he; x++) {
                    const td = document.createElement("td");
                    td.textContent = String(x * y);
                    tr.appendChild(td);
                }
                tbody.appendChild(tr);
            }
            table.appendChild(tbody);

            tableHost.appendChild(table);

            // 5) Hover handler: highlight the hovered row and its column (excluding top header
            // and left-most row labels by default).
            table.addEventListener("mouseover", (e) => {
                const td = e.target.closest("td, th");
                if (!td) return;

                // ignore the header area
                if (td.closest("thead")) return;
                if (td.cellIndex === 0) return; // skip left-most row-label column

                const col = td.cellIndex + 1; // convert 0-based cellIndex -> 1-based nth-child
                const t = td.closest("table");
                t.classList.add("col-hovering");

                // highlight cells in the same column within tbody
                t.querySelectorAll(`tbody td:nth-child(${col}), tbody th:nth-child(${col})`)
                    .forEach(el => el.classList.add("col-hover"));

                td.closest("tr").classList.add("row-hover");
            });


            table.addEventListener("mouseout", (e) => {
                const td = e.target.closest("td, th");
                if (!td) return;
                table.querySelectorAll(".col-hover").forEach(el => el.classList.remove("col-hover"));
                table.querySelectorAll(".row-hover").forEach(el => el.classList.remove("row-hover"));
                table.classList.remove("col-hovering");
                });
            }
    })

        clearBtn.addEventListener("click", function() {
    
            // Resets everything to olding empty strings
            $("#hStart").val("");
            $("#hEnd").val("");
            $("#vStart").val("");
            $("#vEnd").val("");
            
            $("#table-form").validate().resetForm(); // Resets validation errors
            $("#errors").empty(); // Clears any custom errors
            $("#tableHost").empty(); // Clears the table
        });
});
