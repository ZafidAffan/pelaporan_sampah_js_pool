<script>
  async function loadReports() {
    try {
      const res = await fetch("/admin/laporan");
      const data = await res.json();

      if (data.success) {
        const table = document.getElementById("reportTable");
        table.innerHTML = "";

        data.reports.forEach(r => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${r.report_id}</td>
            <td>${r.description}</td>
            <td>${r.status}</td>
            <td>${new Date(r.created_at).toLocaleString()}</td>
          `;
          table.appendChild(tr);
        });
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Gagal memuat laporan.");
    }
  }

  loadReports();
</script>
