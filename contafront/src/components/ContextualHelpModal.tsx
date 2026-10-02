import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  Alert
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

interface ContextualHelpModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  topic: string;
  content: string;
  seniatNote?: string;
  venNifRef?: string;
}

export const ContextualHelpModal: React.FC<ContextualHelpModalProps> = ({
  open,
  onClose,
  title,
  topic,
  content,
  seniatNote,
  venNifRef,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, backgroundColor: '#e3f2fd', color: '#1e88e5' }}>
        <HelpOutlineIcon />
        <Typography variant="h6" fontWeight="bold">
          {title}
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <Typography variant="subtitle2" color="primary" gutterBottom fontWeight="bold">
          Módulo / Tópico: {topic}
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph sx={{ whiteSpace: 'pre-line' }}>
          {content}
        </Typography>

        {seniatNote && (
          <Alert severity="warning" sx={{ mt: 2, borderRadius: 2 }}>
            <Typography variant="caption" fontWeight="bold" display="block">
              Cumplimiento Fiscal SENIAT (2025/2026):
            </Typography>
            <Typography variant="caption">
              {seniatNote}
            </Typography>
          </Alert>
        )}

        {venNifRef && (
          <Alert severity="info" icon={<VerifiedUserIcon />} sx={{ mt: 1.5, borderRadius: 2 }}>
            <Typography variant="caption" fontWeight="bold" display="block">
              Marco Normativo VEN-NIF (FCCPV):
            </Typography>
            <Typography variant="caption">
              {venNifRef}
            </Typography>
          </Alert>
        )}
      </DialogContent>
      <Divider />
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="contained" color="primary">
          Entendido
        </Button>
      </DialogActions>
    </Dialog>
  );
};
