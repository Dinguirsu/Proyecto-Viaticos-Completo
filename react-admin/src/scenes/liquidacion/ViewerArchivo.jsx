import React, { useState, useEffect } from "react";
import api from "../../Services/api";
import {
  Box,
  Typography,
  Button
} from "@mui/material";
import {
  fetchArchivoBlob
} from "../../Services/liquidacionesService";


const getPreviewKind = (mime = "") => {
    const m = mime.toLowerCase();
    if (m.includes("pdf")) return "pdf";
    if (m.startsWith("image/")) return "image";
    return "download";
};

const DocumentoViewer = ({ codigoArchivo, mimeHint }) => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let objectUrl = "";

    const cargar = async () => {
      if (!codigoArchivo) return;

      try {
        setLoading(true);

        // 🔥 Usa tu servicio que ya trae blob
        const blob = await fetchArchivoBlob(codigoArchivo);

        objectUrl = URL.createObjectURL(
          mimeHint ? new Blob([blob], { type: mimeHint }) : blob
        );

        setUrl(objectUrl);
      } catch (e) {
        console.error("Error cargando archivo:", e);
        setUrl("");
      } finally {
        setLoading(false);
      }
    };

    cargar();

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [codigoArchivo, mimeHint]);

  if (loading) return <Typography>Cargando documento...</Typography>;
  if (!url) return <Typography>No hay archivo para mostrar.</Typography>;

  const kind = getPreviewKind(mimeHint || "");

  if (kind === "pdf") {
    return (
      <iframe
        src={`${url}#toolbar=0`}
        width="100%"
        height="600px"
        style={{ border: 0 }}
        title="Documento PDF"
      />
    );
  }

  if (kind === "image") {
    return (
      <img
        src={url}
        alt="Documento"
        style={{ maxWidth: "100%", maxHeight: 600, objectFit: "contain" }}
      />
    );
  }

  // Word / otros: descargar/abrir blob local
  return (
    <Box>
      <Typography sx={{ mb: 2 }}>
        Vista previa no disponible para: <b>{mimeHint}</b>
      </Typography>
      <Button variant="contained" onClick={() => window.open(url, "_blank")}>
        Abrir / Descargar
      </Button>
    </Box>
  );
};

export default DocumentoViewer;