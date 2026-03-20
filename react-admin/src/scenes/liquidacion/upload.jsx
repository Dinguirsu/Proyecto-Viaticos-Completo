import React, { useState } from 'react';
import './FileUpload.css'; // Import a CSS file for styling
import { Button, Box, Typography, Alert } from "@mui/material";
import { cargarLiquidacion } from '../../Services/liquidacionesService';

const FileUpload = ({ numeroLiquidacion, liquidacionData }) => {
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

        const validExtensions = {
            '.doc': 'application/vnd.ms-word',
            '.docx': 'application/vnd.ms-word',
            '.xls': 'application/vnd.ms-excel',
            '.xlsx': 'application/vnd.ms-excel',
            '.jpg': 'image/jpg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.pdf': 'application/pdf'
        };

        const fileExtension = `.${selectedFile.name.split('.').pop()}`;
        const contentType = validExtensions[fileExtension] || '';

        if (contentType) {
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('numeroLiquidacion', numeroLiquidacion);
            formData.append("liquidacionData", JSON.stringify(liquidacionData));

            try {

                const response = await cargarLiquidacion(formData);
                setMessage('Archivo subido exitosamente');
                
                if (response.status === 200) {
                    setMessage('Archivo subido exitosamente');
                } else {
                    setMessage(`Error del servidor: ${response.statusText}`);
                }

            } catch (error) {
                console.error('Error al subir el archivo:', error);
                setMessage('Ocurrió un error al intentar subir el archivo.');
            }
        } else {
            setMessage('Formato de archivo no reconocido. Solo subir formatos Imagen/Word/PDF/Excel.');
        }
    };

    return (
        <Box mt="20px">
            <Typography variant="h6" mb="10px">
                Cargar Archivo
            </Typography>
            <input type="file" name="file" onChange={handleFileChange} />
            <Button
                variant="contained"
                color="primary"
                onClick={handleFileUpload}
                style={{ marginTop: '10px' }}
            >
                Guardar Liquidacion
            </Button>

            {message && (
                <Alert severity={message.includes('exitosamente') ? "success" : "error"} sx={{ mt: 2 }}>
                    {message}
                </Alert>
            )}
        </Box>
    );
};

export default FileUpload;
