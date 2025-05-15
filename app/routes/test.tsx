import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase-s3';

export default function TestBucket() {
  const [files, setFiles] = useState<string[]>([]);
  const [error, setError] = useState<string|null>(null);

  useEffect(() => {
    (async () => {
      try {
        // NÃO lista buckets aqui
        // Simplesmente tenta listar objetos num bucket já existente
        const { data, error } = await supabase
          .storage
          .from('aniversariantes-bucket')
          .list('', { limit: 100 });

        if (error) throw error;
        setFiles(data.map(f => f.name));
      } catch (err: any) {
        setError(err.message);
      }
    })();
  }, []);

  if (error) return <p className="text-red-600">Erro: {error}</p>;
  if (!files) return <p>Carregando...</p>;
  return (
    <div>
      <h1>Arquivos no bucket</h1>
      {files.length > 0
        ? <ul>{files.map(n => <li key={n}>{n}</li>)}</ul>
        : <p>Nenhum arquivo encontrado.</p>
      }
    </div>
  );
}
