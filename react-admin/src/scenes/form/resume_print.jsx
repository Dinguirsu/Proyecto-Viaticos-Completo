import React from 'react';
import { Button } from '@mui/material';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const PDFTableGenerator = () => {

  const handleGeneratePdf = () => {
    const doc = new jsPDF();

    // Definir columnas y filas
    const columns = ["Lugar a Visitar", "Objetivo Misión", "Observaciones", "Fecha Salida", "Hora Salida"];
    const rows = [
      ["El Salvador", "Reunión con socios", "Confirmar acuerdos", "29/06/2024", "08:00 AM"],
      ["Honduras", "Visita a la planta", "Inspección de instalaciones", "30/06/2024", "09:00 AM"],
      ["Guatemala", "Presentación de proyecto", "Negociación de contratos", "01/07/2024", "10:00 AM"],
    ];

    // Añadir la tabla al PDF
    doc.autoTable({
      head: [columns],
      body: rows,
    });

    // Guardar el PDF
    doc.save('table.pdf');

    // Mostrar el PDF en el navegador
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl);
  };

  return (
    <div>
      <Button variant="contained" color="primary" onClick={handleGeneratePdf}>
        Generar PDF con Tabla
      </Button>
    </div>
  );
};

export default PDFTableGenerator;