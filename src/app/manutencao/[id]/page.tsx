import { Container } from '@mui/material';
import ManutencaoForm from '@/components/ManutencaoForm';

export default function Manutencao({ params }: { params: { id: string } }) {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <ManutencaoForm id={params.id} />
    </Container>
  );
}
