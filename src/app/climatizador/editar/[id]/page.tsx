import { Container } from '@mui/material';
import ClimatizadorForm from '@/components/ClimatizadorForm';

export default function EditarClimatizador({ params }: { params: { id: string } }) {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <ClimatizadorForm id={params.id} />
    </Container>
  );
}
