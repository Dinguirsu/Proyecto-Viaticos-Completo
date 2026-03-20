export const dataGridSx = {
  border: "1px solid rgba(255,255,255,0.10)",
  borderRadius: 2,
  backgroundColor: "rgba(255,255,255,0.03)",

  // Header
  "& .MuiDataGrid-columnHeaders": {
    backgroundColor: "#0b7285",
    color: "#fff",
    fontWeight: 900,
    borderBottom: "none",
  },
  "& .MuiDataGrid-columnHeaderTitle": {
    fontWeight: 900,
  },

  // Body / Scroller
  "& .MuiDataGrid-virtualScroller": {
    backgroundColor: "#0f172a",
  },

  // Cells
  "& .MuiDataGrid-cell": {
    color: "#e5e7eb",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    outline: "none !important",
  },

  // Row hover
  "& .MuiDataGrid-row:hover": {
    backgroundColor: "rgba(255,255,255,0.06)",
  },

  // Toolbar container
  "& .MuiDataGrid-toolbarContainer": {
    padding: "10px 10px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.03)",
  },

  // Quick filter (buscador)
  "& .MuiDataGrid-toolbarContainer .MuiInputBase-root": {
    height: 36,
    fontSize: 13,
    borderRadius: 10,
    paddingRight: 8,
    backgroundColor: "rgba(255,255,255,0.06)",
    color: "#e5e7eb",
  },
  "& .MuiDataGrid-toolbarContainer .MuiInputBase-input": {
    padding: "8px 10px",
  },
  "& .MuiDataGrid-toolbarContainer .MuiSvgIcon-root": {
    color: "rgba(255,255,255,0.7)",
  },

  // Footer / pagination
  "& .MuiDataGrid-footerContainer": {
    borderTop: "1px solid rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  "& .MuiTablePagination-root": {
    color: "rgba(255,255,255,0.85)",
  },
  "& .MuiTablePagination-selectIcon": {
    color: "rgba(255,255,255,0.85)",
  },

  // Remove focus rings
  "& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-cell:focus": {
    outline: "none !important",
  },
};
