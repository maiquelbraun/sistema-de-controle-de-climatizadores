import { Container } from '@mui/material';
import ManutencaoForm from '@/components/ManutencaoForm';

export default function NovaManutencao() {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <ManutencaoForm />
    </Container>
  );
}
