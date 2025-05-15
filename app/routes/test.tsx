// app/routes/test.tsx - Versão atualizada com melhor tratamento do bucket
import { useEffect, useState } from 'react';
import supabase, { BUCKET_NAME, checkBucketExists } from '@/utils/supabase';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { InfoIcon, AlertCircleIcon, CheckCircleIcon, DatabaseIcon, FileIcon } from 'lucide-react';

export default function TestBucket() {
  const [status, setStatus] = useState<'loading' | 'error' | 'success' | 'not-found'>('loading');
  const [files, setFiles] = useState<Array<{name: string, size: number, created_at: string}>>([]);
  const [error, setError] = useState<string | null>(null);
  const [buckets, setBuckets] = useState<string[]>([]);
  const [bucketMessage, setBucketMessage] = useState<string>('');
  
  // Estados para teste do banco de dados
  const [dbStatus, setDbStatus] = useState<'loading' | 'error' | 'success'>('loading');
  const [dbError, setDbError] = useState<string | null>(null);
  const [dbData, setDbData] = useState<any>(null);
  const [dbTables, setDbTables] = useState<string[]>([]);

  // Função alterantiva para verificar tabelas
  async function verifyAniversariantesTable() {
    try {
      // Método direto: verificar se a tabela aniversariantes existe e tem dados
      const { data, error, count } = await supabase
        .from('aniversariantes')
        .select('*', { count: 'exact' })
        .limit(3);
        
      if (error) {
        if (error.message.includes('relation "aniversariantes" does not exist')) {
          setDbTables([]);
          setDbData(null);
        } else {
          throw error;
        }
      } else {
        setDbTables(['aniversariantes']);
        setDbData({
          count: count || 0,
          sample: data || []
        });
      }
      
      setDbStatus('success');
    } catch (err: any) {
      console.error('Erro ao verificar tabela aniversariantes:', err);
      setDbError(err.message || 'Erro desconhecido');
      setDbStatus('error');
    }
  }

  // Função para testar upload para o bucket
  async function testUploadToBucket() {
    if (status !== 'success') return;
    
    try {
      // Criar um arquivo de teste simples
      const testContent = new Blob([`Teste de upload: ${new Date().toISOString()}`], 
                                   { type: 'text/plain' });
      const testFile = new File([testContent], `test-file-${Date.now()}.txt`);
      
      // Tentar fazer upload do arquivo
      const { data, error } = await supabase
        .storage
        .from(BUCKET_NAME)
        .upload(`test-${Date.now()}.txt`, testFile);
        
      if (error) {
        alert(`Erro ao fazer upload: ${error.message}`);
      } else {
        alert('Upload realizado com sucesso! Recarregando a página para atualizar a lista de arquivos.');
        window.location.reload();
      }
    } catch (err: any) {
      alert(`Erro no teste de upload: ${err.message}`);
    }
  }

  useEffect(() => {
    async function testBucketConnection() {
      try {
        setStatus('loading');
        
        // Primeiro, liste todos os buckets disponíveis
        const { data: bucketsData, error: bucketError } = await supabase.storage.listBuckets();
        
        if (bucketError) {
          console.warn('Aviso ao listar buckets:', bucketError);
          setBucketMessage(
            'Não foi possível listar buckets. Isso geralmente ocorre devido a restrições de permissão. ' +
            'Verifique se o bucket "aniversariantes-bucket" já foi criado no Dashboard do Supabase.'
          );
        } else {
          const bucketNames = bucketsData?.map(b => b.name) || [];
          setBuckets(bucketNames);
          console.log('Buckets disponíveis:', bucketNames);
          
          // Verifica se o bucket alvo existe na lista
          if (!bucketNames.includes(BUCKET_NAME)) {
            setStatus('not-found');
            setBucketMessage(`Bucket "${BUCKET_NAME}" não encontrado entre os buckets disponíveis. É necessário criá-lo no Dashboard do Supabase.`);
            return;
          }
        }
        
        // Tenta listar os arquivos no bucket diretamente
        console.log(`Tentando listar arquivos no bucket "${BUCKET_NAME}"...`);
        const { data: filesData, error: filesError } = await supabase
          .storage
          .from(BUCKET_NAME)
          .list('', { 
            limit: 100,
            offset: 0,
            sortBy: { column: 'name', order: 'asc' } 
          });
          
        if (filesError) {
          // Se não conseguir listar arquivos, pode ser problema de permissão
          if (filesError.message.includes('The resource was not found') || 
              filesError.message.includes('violates row-level security policy')) {
            setStatus('not-found');
            setBucketMessage(
              `O bucket "${BUCKET_NAME}" existe, mas você não tem permissão para listar seus arquivos. ` +
              'É necessário configurar as políticas de RLS para o bucket no Dashboard do Supabase.'
            );
            return;
          }
          
          throw new Error(`Erro ao listar arquivos: ${filesError.message}`);
        }
        
        // Se chegou até aqui, conseguiu acessar o bucket com sucesso
        console.log(`Bucket "${BUCKET_NAME}" acessado com sucesso:`, filesData);
        
        setFiles(
          (filesData ?? []).map((file: any) => ({
            name: file.name,
            size: typeof file.metadata?.size === 'number' ? file.metadata.size : (file.size ?? 0),
            created_at: file.created_at ?? '-'
          }))
        );
        setStatus('success');
      } catch (err: any) {
        console.error('Erro completo:', err);
        setError(err.message || 'Erro desconhecido');
        setStatus('error');
      }
    }
    
    // Executa ambos os testes
    testBucketConnection();
    verifyAniversariantesTable();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Testes de Conexão Supabase</h1>
      
      {/* Seção de teste do banco de dados */}
      <div className="mb-8 p-6 border rounded-lg bg-white shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <DatabaseIcon className="text-blue-500" />
          <h2 className="text-xl font-semibold">Conexão com Banco de Dados</h2>
        </div>
        
        {dbStatus === 'loading' && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
        
        {dbStatus === 'error' && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircleIcon className="h-5 w-5" />
            <AlertTitle>Erro ao conectar ao banco de dados</AlertTitle>
            <AlertDescription>
              {dbError}
              
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <h3 className="text-red-800 font-medium mb-2">Sugestões para resolver:</h3>
                <ol className="list-decimal pl-5 space-y-1 text-red-700">
                  <li>Verifique se o seu projeto Supabase está ativo (não está pausado)</li>
                  <li>Confirme se as variáveis de ambiente no arquivo .env estão corretas</li>
                  <li>Verifique se a sua chave anônima (ANON_KEY) tem permissões adequadas</li>
                  <li>Tente recriar o banco ou ajustar as políticas de RLS se necessário</li>
                </ol>
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        {dbStatus === 'success' && (
          <>
            <Alert className="mb-4 bg-green-50 border-green-200">
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
              <AlertTitle>Conexão com o banco de dados estabelecida com sucesso!</AlertTitle>
              <AlertDescription>
                O cliente Supabase conseguiu se conectar ao banco de dados.
              </AlertDescription>
            </Alert>
            
            <div className="mb-6">
              <h3 className="text-md font-medium mb-2">Tabelas identificadas:</h3>
              {dbTables.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {dbTables.map((table, idx) => (
                    <div 
                      key={idx} 
                      className={`p-2 rounded border ${table === 'aniversariantes' ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'}`}
                    >
                      {table} {table === 'aniversariantes' && <span className="text-blue-500 font-medium">(✓)</span>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-yellow-700">Nenhuma tabela encontrada no esquema 'public'.</p>
                  <p className="text-yellow-700 mt-2">Talvez seja necessário criar a tabela 'aniversariantes'.</p>
                </div>
              )}
            </div>
            
            {dbData && dbData.sample && (
              <div>
                <h3 className="text-md font-medium mb-2">Dados da tabela 'aniversariantes':</h3>
                <div className="p-3 bg-gray-50 rounded border mb-2">
                  <p className="text-sm font-medium">Quantidade de registros: <span className="font-normal">{dbData.count}</span></p>
                </div>
                
                {dbData.sample.length > 0 ? (
                  <>
                    <p className="text-sm text-gray-500 mb-2">Amostra dos dados (até 3 registros):</p>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 border">
                        <thead className="bg-gray-100">
                          <tr>
                            {Object.keys(dbData.sample[0]).filter(key => 
                              // Filtra algumas colunas excessivamente longas
                              !['id', 'created_at', 'foto'].includes(key)
                            ).map(key => (
                              <th key={key} scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {key}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {dbData.sample.map((item: any, index: number) => (
                            <tr key={index}>
                              {Object.entries(item).filter(([key]) => 
                                !['id', 'created_at', 'foto'].includes(key)
                              ).map(([key, value], valIndex) => (
                                <td key={valIndex} className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">
                                  {typeof value === 'object' ? JSON.stringify(value) : String(value || '-')}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-600">A tabela 'aniversariantes' existe, mas não contém registros.</p>
                )}
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Seção de buckets */}
      <div className="mb-8 p-6 border rounded-lg bg-white shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <FileIcon className="text-green-500" />
          <h2 className="text-xl font-semibold">Conexão com Storage (Bucket)</h2>
        </div>
        
        <div className="mb-4">
          <h3 className="text-md font-medium mb-2">Buckets Disponíveis:</h3>
          {buckets.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {buckets.map(bucket => (
                <div 
                  key={bucket} 
                  className={`p-2 rounded border ${bucket === BUCKET_NAME ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}
                >
                  {bucket} {bucket === BUCKET_NAME && <span className="text-green-600 font-medium">(bucket alvo)</span>}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-yellow-600">
                {bucketMessage || "Nenhum bucket encontrado."}
              </p>
            </div>
          )}
        </div>
        
        {status === 'not-found' && (
          <Alert className="mb-4">
            <AlertCircleIcon className="h-5 w-5" />
            <AlertTitle>O bucket não existe ou não está acessível</AlertTitle>
            <AlertDescription>
              <p className="mb-4">{bucketMessage}</p>
              <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200 mb-4">
                <h3 className="text-yellow-800 font-medium mb-2">Instruções para criar o bucket:</h3>
                <ol className="text-yellow-700 list-decimal pl-5 space-y-2">
                  <li>Acesse o <a href="https://app.supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Dashboard do Supabase</a> e faça login</li>
                  <li>Selecione seu projeto</li>
                  <li>No menu lateral, vá para "Storage"</li>
                  <li>Clique em "Create a new bucket"</li>
                  <li>Nomeie o bucket como <strong>aniversariantes-bucket</strong></li>
                  <li>Marque a opção "Public bucket" se desejar que os arquivos sejam públicos</li>
                  <li>Clique em "Create bucket"</li>
                  <li>Depois, acesse a aba "Policies" do bucket e configure permissões para permitir operações de Insert/Select/Update/Delete</li>
                </ol>
              </div>
              <Button onClick={() => window.location.reload()}>
                Verificar novamente
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        {status === 'error' && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircleIcon className="h-5 w-5" />
            <AlertTitle>Erro ao conectar ao bucket</AlertTitle>
            <AlertDescription>
              <p className="mb-2">{error}</p>
              
              <div className="bg-red-50 p-4 rounded-md border border-red-200 mt-3">
                <p className="font-medium text-red-800 mb-2">Sugestões para verificar:</p>
                <ol className="list-decimal pl-5 space-y-1 text-red-700">
                  <li>Verifique se o nome do bucket <strong>"{BUCKET_NAME}"</strong> está correto</li>
                  <li>Confirme que as políticas RLS estão configuradas corretamente</li>
                  <li>Teste cada operação (SELECT, INSERT, etc.) separadamente</li>
                  <li>Verifique o console do navegador (F12) para ver erros detalhados</li>
                </ol>
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        {status === 'success' && (
          <>
            <Alert className="mb-4 bg-green-50 border-green-200">
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
              <AlertTitle>Bucket acessado com sucesso!</AlertTitle>
              <AlertDescription>
                O cliente Supabase conseguiu se conectar ao bucket <strong>{BUCKET_NAME}</strong>.
              </AlertDescription>
            </Alert>
            
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-md font-medium">Arquivos no Bucket:</h3>
              <Button 
                onClick={testUploadToBucket} 
                size="sm" 
                className="text-xs"
                variant="outline"
              >
                Testar Upload
              </Button>
            </div>
            
            {files.length > 0 ? (
              <div className="overflow-x-auto border rounded">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tamanho</th>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data de Criação</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {files.map(file => (
                      <tr key={file.name}>
                        <td className="px-3 py-2 whitespace-nowrap text-sm">{file.name}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm">{formatFileSize(file.size)}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm">{formatDate(file.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-600 p-4 bg-gray-50 rounded border">Nenhum arquivo encontrado no bucket.</p>
            )}
            
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h3 className="text-blue-800 font-medium mb-2">Próximos passos:</h3>
              <ol className="list-decimal pl-5 space-y-1 text-blue-700">
                <li>Seu componente AniversariantesDoMes deve funcionar corretamente agora</li>
                <li>Teste o upload de imagens no formulário de criação de aniversariantes</li>
                <li>Se ainda tiver problemas, verifique o console do navegador para erros detalhados</li>
              </ol>
            </div>
          </>
        )}
        
        {status === 'loading' && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDate(dateStr: string): string {
  if (!dateStr || dateStr === '-') return '-';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  } catch (e) {
    return dateStr; // Retorna a string original se não conseguir converter
  }
}