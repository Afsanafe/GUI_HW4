/*
File: app.js
Assignment: Wait until the DOM is ready before running any code that queries elements.
document.addEventListener("DOMContentLoaded", () => { *New* jQuery version:

Author: Afsa Nafe
Affiliation: UMass Lowell, Computer Science Department
Email: afsa_nafe@student.uml.edu
Copyright (c) 2025 by Afsa Nafe. 
All rights reserved. May be freely copied or excerpted for educational purposes 
with credit to the author.
Last updated by Afsa Nafe on November 8th, 2025 at 12:53 PM
*/


/*
File: app.js
Updated for Part 2: Dynamic Tabs
*/

// Wait for the DOM to be ready
$(document).ready(function() {

    // --- 1. INITIALIZE WIDGETS ---
    // This line activates the tabs!
    $("#tabs").tabs();

    // --- 2. HELPER FUNCTIONS ---
    /**
     * Helper function to initialize a slider and link it
     */
    function setupSlider(sliderId, inputId) {
        $("#" + sliderId).slider({
            min: -50,
            max: 50,
            value: 0,
            // "slide" event fires as you are dragging
            slide: function(event, ui) {
                $("#" + inputId).val(ui.value);
                // We will add the "live preview" update here later
            }
        });

        // "change" event fires when you blur (click out)
        $("#" + inputId).on("change", function() {
            var value = $(this).val();
            $("#" + sliderId).slider("value", value);
            // We will add the "live preview" update here later
        });
    }

    /**
     * Builds and returns a new <table> element.
     * This is your code, moved to be a standalone function.
     */
    function buildTableElement(hs, he, vs, ve) {
        // 4) Build table: create elements in memory, then attach to DOM
        const table = document.createElement("table");
        const thead = document.createElement("thead");
        const headRow = document.createElement("tr");

        // top-left corner header
        const corner = document.createElement("th");
        corner.className = "corner";
        corner.textContent = "x";
        headRow.appendChild(corner);

        // horizontal header cells
        for (let x = hs; x <= he; x++) {
            const th = document.createElement("th");
            th.textContent = String(x);
            headRow.appendChild(th);
        }
        thead.appendChild(headRow);
        table.appendChild(thead);

        // tbody rows and cells
        const tbody = document.createElement("tbody");

        for (let y = vs; y <= ve; y++) {
            const tr = document.createElement("tr");
            const rowTh = document.createElement("th"); // row header (left-most)
            rowTh.textContent = String(y);
            tr.appendChild(rowTh);
            
            // each cell in every row
            for (let x = hs; x <= he; x++) {
                const td = document.createElement("td");
                td.textContent = String(x * y);
                tr.appendChild(td);
            }
            tbody.appendChild(tr); // Correctly append <tr> to <tbody>
        }
        table.appendChild(tbody); // Append <tbody> to <table>

        // 5) Hover handler:
        // Using jQuery's .on() for event delegation
        $(table).on("mouseover", "td, th", function(e) {
            const td = $(this); // 'this' is the cell being hovered
            if (td.closest("thead").length || td.index() === 0) return;

            const t = td.closest("table");
            t.addClass("col-hovering");
            
            const colIndex = td.index() + 1;
            t.find(`tbody td:nth-child(${colIndex}), tbody th:nth-child(${colIndex})`).addClass("col-hover");
            td.closest("tr").addClass("row-hover");
        });

        $(table).on("mouseout", "td, th", function(e) {
            const t = $(this).closest("table");
            t.find(".col-hover").removeClass("col-hover");
            t.find(".row-hover").removeClass("row-hover");
            t.removeClass("col-hovering");
        });

        return table;
    }

    // --- 3. SET UP SLIDERS ---
    setupSlider("hStartSlider", "hStart");
    setupSlider("hEndSlider", "hEnd");
    setupSlider("vStartSlider", "vStart");
    setupSlider("vEndSlider", "vEnd");

    // --- 4. SET UP VALIDATION & SUBMIT HANDLER ---
    $("#table-form").validate({
        rules: {
            hStart: { required: true, number: true, range: [-50, 50] },
            hEnd: { required: true, number: true, range: [-50, 50] },
            vStart: { required: true, number: true, range: [-50, 50] },
            vEnd: { required: true, number: true, range: [-50, 50] }
        },
        messages: {
             hStart: {
                required: "The minimum row value is required.",
                number: "Must be a valid number.",
                range: "Please enter a value between -50 and 50."
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
        wrapper: "span",

        /**
         * This function now creates a new tab with the table.
         */
        submitHandler: function(form) {
            // 1) Read values from inputs
            const hStart = parseInt($("#hStart").val(), 10);
            const hEnd = parseInt($("#hEnd").val(), 10);
            const vStart = parseInt($("#vStart").val(), 10);
            const vEnd = parseInt($("#vEnd").val(), 10);

            // 2) Normalize ranges (swap start/end if needed)
            let hs = hStart, he = hEnd, vs = vStart, ve = vEnd;
            if (hs > he) [hs, he] = [he, hs];
            if (vs > ve) [vs, ve] = [ve, vs];

            // 3) Final "business logic" check for table size
            const cols = (he - hs + 1);
            const rows = (ve - vs + 1);
            const cells = rows * cols;
            const MAX_CELLS = 10000; // From your original code

            if (cells > MAX_CELLS) {
                $("#errors").text(`Table too large (${cells} cells). Please reduce the range.`);
                return;
            }
            $("#errors").empty(); // Clear any previous errors

            // 4) Create a title and unique ID for the new tab
            const tabTitle = `[${hs} to ${he}] x [${vs} to ${ve}]`;
            const tabId = "tab-" + new Date().getTime(); // Simple unique ID

            // 5) Create the new tab header (the <li>)
            // We add a "close" icon to meet the "delete individual tabs" requirement
            const $tabHeader = $("<li><a href='#" + tabId + "'>" + tabTitle + "</a> <span class='ui-icon ui-icon-close' role='presentation'>Remove Tab</span></li>");

            // 6) Create the new tab content panel (the <div>)
            // We add the .table-wrap and .scroller classes from your HTML for styling
            const $tabContent = $("<div id='" + tabId + "' class='table-wrap scroller'></div>");
            
            // 7) Build the table using our new function
            const $table = buildTableElement(hs, he, vs, ve);
            
            // 8) Put the table inside the new content panel
            $tabContent.append($table);
            
            // 9) Add the new tab header and content to the widget
            $("#tabs .ui-tabs-nav").append($tabHeader); // Add <li> to the <ul>
            $("#tabs").append($tabContent); // Add <div> to the main #tabs
            
            // 10) "Refresh" the widget so it sees the new tab
            $("#tabs").tabs("refresh");
            
            // 11) Automatically switch to the new tab (-1 means the last tab)
            $("#tabs").tabs("option", "active", -1);
        }
    });

    // --- 5. CLEAR BUTTON ---
    $("#clearBtn").on("click", function() { // Use jQuery click listener
        $("#hStart").val("");
        $("#hEnd").val("");
        $("#vStart").val("");
        $("#vEnd").val("");
        
        $(".slider").slider("value", 0); // Also reset sliders

        $("#table-form").validate().resetForm(); // Resets validation errors
        $("#errors").empty(); // Clears any custom errors
        $("#tableHost").empty(); // Clears the live preview table
    });

    // --- 5. TAB DELETION LOGIC ---

    /**
     * 1. Delete INDIVIDUAL tabs (fulfills "delete individual tabs" requirement)
     * * We use "event delegation" by attaching the listener to the main
     * #tabs container. This allows us to listen for clicks on 
     * 'span.ui-icon-close' elements that don't exist yet.
     */
    $("#tabs").on("click", "span.ui-icon-close", function() {
        
        // 'this' is the <span> icon that was clicked
        // Find the <li> parent of the icon
        const $li = $(this).closest("li");
        
        // Find the ID of the content panel from the <li>'s "aria-controls" attribute
        const panelId = $li.attr("aria-controls");
        
        // Remove the <li> (the tab header)
        $li.remove();
        
        // Remove the content panel (the <div>)
        $("#" + panelId).remove();
        
        // Refresh the tabs widget to show the changes
        $("#tabs").tabs("refresh");
    });

    /**
     * 2. Delete MULTIPLE tabs (fulfills "delete multiple tabs" requirement)
     * * This adds a simple click listener to your button.
     */
    $("#deleteAllTabsBtn").on("click", function() {
        
        // Find all tab headers (<li>) EXCEPT the first one (the "Controls" tab)
        // and remove them.
        $("#tabs .ui-tabs-nav li:not(:first-child)").remove();
        
        // Find all content panels (<div>) EXCEPT the first one (#tab-controls)
        // and remove them.
        $("#tabs > div:not(#tab-controls)").remove();
        
        // Refresh the tabs widget
        $("#tabs").tabs("refresh");
    });
});