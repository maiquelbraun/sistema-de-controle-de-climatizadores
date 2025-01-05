import { Container } from '@mui/material';
import ClimatizadorForm from '@/components/ClimatizadorForm';

export default function NovoClimatizador() {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <ClimatizadorForm />
    </Container>
  );
}
