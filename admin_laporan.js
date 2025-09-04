app.get("/admin/laporan", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM reports ORDER BY created_at DESC");
    res.json(rows); // langsung array
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal ambil data laporan" });
  }
});
