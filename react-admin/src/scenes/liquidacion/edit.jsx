import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import React, { useState } from 'react';
import axios from 'axios';

const EditFileDialog = ({ open, onClose, liquidacion }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState('');

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      setMessage('Por favor, seleccione un archivo.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('numeroLiquidacion', liquidacion.NumeroLiquidacion);

    try {
      await axios.post(`http://localhost:3000/api/actualizarDocumentoLiquidacion`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage('Archivo actualizado exitosamente.');
    } catch (error) {
      console.error(error);
      setMessage('Error al actualizar el archivo.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Editar Documento de Liquidación</DialogTitle>
      <DialogContent>
        <Typography>Liquidación #: {liquidacion?.NumeroLiquidacion}</Typography>
        <input type="file" onChange={handleFileChange} style={{ marginTop: '20px' }} />
        {message && (
          <Typography sx={{ mt: 2 }} color={message.includes('exitosamente') ? 'green' : 'red'}>
            {message}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleFileUpload} variant="contained" color="primary">Guardar Cambios</Button>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditFileDialog;
