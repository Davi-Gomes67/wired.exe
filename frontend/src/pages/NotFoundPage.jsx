import { Compass } from 'lucide-react';
import EmptyState from '../components/EmptyState';

function NotFoundPage() {
  return (
    <div className="container-page py-16">
      <EmptyState
        icon={Compass}
        title="Página não encontrada"
        description="O endereço acessado não existe neste sistema."
        actionTo="/"
        actionLabel="Voltar ao início"
      />
    </div>
  );
}

export default NotFoundPage;
