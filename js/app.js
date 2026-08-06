document.addEventListener("DOMContentLoaded", () => {

    const tbody = document.getElementById("dispatchTable");

    const searchBox = document.getElementById("searchBox");
    const clusterFilter = document.getElementById("clusterFilter");
    const statusFilter = document.getElementById("statusFilter");
    const clearButton = document.getElementById("clearFilters");

    let allData = [];

    let CLUSTER = "";
    let CX_NAME = "";

    // ==========================================
    // LOAD CSV
    // ==========================================

    Papa.parse("data/dispatch.csv", {

        download: true,
        header: true,
        skipEmptyLines: true,

        complete: function(results){

            allData = results.data;

            const headers = Object.keys(allData[0]);

            CLUSTER = headers.find(h =>
                h.toUpperCase().replace(/\s/g,"") === "CLUSTER"
            );

            CX_NAME = headers.find(h =>
                h.toUpperCase().replace(/\s/g,"") === "CXNAME"
            );

            populateClusterFilter();
            buildTable();

        }

    });

    // ==========================================
    // POPULATE CLUSTER DROPDOWN
    // ==========================================

    function populateClusterFilter(){

        clusterFilter.innerHTML =
            '<option value="ALL">All Clusters</option>';

        const clusters = [...new Set(
            allData.map(r => r[CLUSTER])
        )].filter(Boolean);

        clusters.sort();

        clusters.forEach(cluster=>{

            const option = document.createElement("option");

            option.value = cluster;
            option.textContent = cluster;

            clusterFilter.appendChild(option);

        });

    }

    // ==========================================
    // BUILD TABLE
    // ==========================================

    function buildTable(){

        tbody.innerHTML="";

        const keyword = searchBox.value.toLowerCase();
        const selectedCluster = clusterFilter.value;

        const clusters=[...new Set(
            allData.map(r=>r[CLUSTER])
        )].filter(Boolean);

        clusters.forEach(cluster=>{

            let technicians = allData.filter(r =>
                r[CLUSTER] === cluster
            );

            technicians = [...new Map(

                technicians.map(item=>[
                    item[CX_NAME],
                    item
                ])

            ).values()];

            technicians = technicians.filter(person=>{

                const searchMatch =
                    keyword==="" ||
                    person[CX_NAME].toLowerCase().includes(keyword);

                const clusterMatch =
                    selectedCluster==="ALL" ||
                    cluster===selectedCluster;

                return searchMatch && clusterMatch;

            });

            if(technicians.length===0)
                return;

            const clusterRow=document.createElement("tr");

            clusterRow.className="cluster-row";

            clusterRow.innerHTML=`

                <td class="first-col">${cluster}</td>
                <td colspan="44">Cluster Totals</td>

            `;

            tbody.appendChild(clusterRow);

            technicians.forEach(person=>{

                const row=document.createElement("tr");

                row.innerHTML=`

                    <td class="first-col">
                        ${person[CX_NAME]}
                    </td>

                    <td colspan="44">
                        Loading...
                    </td>

                `;

                tbody.appendChild(row);

            });

        });

    }

    // ==========================================
    // EVENTS
    // ==========================================

    searchBox.addEventListener("keyup", buildTable);
    clusterFilter.addEventListener("change", buildTable);
    statusFilter.addEventListener("change", buildTable);

    clearButton.addEventListener("click",()=>{

        searchBox.value="";
        clusterFilter.value="ALL";
        statusFilter.value="ALL";

        buildTable();

    });

});