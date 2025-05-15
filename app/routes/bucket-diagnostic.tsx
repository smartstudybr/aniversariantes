// app/routes/bucket-diagnostic.tsx
// Uma nova rota específica para diagnóstico do bucket
import { useEffect, useState } from 'react';
import supabase, { BUCKET_NAME } from '@/utils/supabase';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { InfoIcon, AlertCircleIcon, CheckCircleIcon, FileIcon } from 'lucide-react';

export default function BucketDiagnostic() {
  const [step, setStep] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [buckets, setBuckets] = useState<string[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [testStatus, setTestStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [testError, setTestError] = useState<string | null>(null);
  
  // Função para adicionar logs
  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toISOString()}] ${message}`]);
  };
  
  // Função para executar o diagnóstico passo a passo
  const runDiagnostic = async () => {
    try {
      setTestStatus('running');
      setLogs([]);
      
      // Passo 1: Verificar conexão básica
      setStep(1);
      addLog('Iniciando diagnóstico do bucket...');
      addLog(`Bucket alvo: "${BUCKET_NAME}"`);
      
      // Passo 2: Listar buckets
      setStep(2);
      addLog('Tentando listar todos os buckets...');
      
      const { data: bucketsData, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        throw new Error(`Erro ao listar buckets: ${bucketsError.message}`);
      }
      
      const bucketNames = bucketsData?.map(b => b.name) || [];
      setBuckets(bucketNames);
      
      addLog(`Buckets encontrados (${bucketNames.length}): ${bucketNames.join(', ') || 'nenhum'}`);
      
      // Passo 3: Verificar se o bucket específico existe
      setStep(3);
      const targetBucketExists = bucketNames.includes(BUCKET_NAME);
      
      if (!targetBucketExists) {
        throw new Error(`Bucket "${BUCKET_NAME}" não encontrado entre os buckets disponíveis`);
      }
      
      addLog(`✅ Bucket "${BUCKET_NAME}" encontrado!`);
      
      // Passo 4: Listar arquivos no bucket
      setStep(4);
      addLog(`Tentando listar arquivos do bucket "${BUCKET_NAME}"...`);
      
      const { data: filesData, error: filesError } = await supabase
        .storage
        .from(BUCKET_NAME)
        .list('');
        
      if (filesError) {
        throw new Error(`Erro ao listar arquivos: ${filesError.message}`);
      }
      
      setFiles(filesData || []);
      addLog(`✅ Listagem de arquivos bem-sucedida! Encontrados ${filesData?.length || 0} arquivos.`);
      
      // Passo 5: Teste de upload
      setStep(5);
      addLog('Tentando fazer upload de um arquivo de teste...');
      
      // Criar um pequeno arquivo de teste
      const testContent = new Blob([`Teste de diagnóstico: ${new Date().toISOString()}`], 
                                  { type: 'text/plain' });
      const fileName = `test-file-${Date.now()}.txt`;
      const testFile = new File([testContent], fileName);
      
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from(BUCKET_NAME)
        .upload(fileName, testFile);
        
      if (uploadError) {
        throw new Error(`Erro ao fazer upload: ${uploadError.message}`);
      }
      
      addLog(`✅ Upload bem-sucedido! Arquivo "${fileName}" enviado.`);
      
      // Passo 6: Atualizar lista de arquivos
      setStep(6);
      addLog('Atualizando lista de arquivos...');
      
      const { data: newFilesData } = await supabase
        .storage
        .from(BUCKET_NAME)
        .list('');
        
      setFiles(newFilesData || []);
      addLog(`Lista de arquivos atualizada. Agora há ${newFilesData?.length || 0} arquivos.`);
      
      // Diagnóstico concluído com sucesso
      setStep(7);
      addLog('✅ Diagnóstico concluído com sucesso! O bucket está funcionando corretamente.');
      setTestStatus('success');
      
    } catch (err: any) {
      console.error('Erro no diagnóstico:', err);
      addLog(`❌ ERRO: ${err.message}`);
      setTestError(err.message);
      setTestStatus('error');
    }
  };
  
  // Função para testar um upload simples
  const testUpload = async () => {
    try {
      addLog('Testando upload simples...');
      
      // Criar um pequeno arquivo de teste
      const testContent = new Blob([`Teste rápido: ${new Date().toISOString()}`], 
                                  { type: 'text/plain' });
      const fileName = `quick-test-${Date.now()}.txt`;
      const testFile = new File([testContent], fileName);
      
      const { data, error } = await supabase
        .storage
        .from(BUCKET_NAME)
        .upload(fileName, testFile);
        
      if (error) {
        addLog(`❌ Erro no upload: ${error.message}`);
        return;
      }
      
      addLog(`✅ Upload rápido bem-sucedido! Arquivo "${fileName}" enviado.`);
      
      // Atualizar a lista de arquivos
      const { data: newFiles } = await supabase
        .storage
        .from(BUCKET_NAME)
        .list('');
        
      setFiles(newFiles || []);
      
    } catch (err: any) {
      addLog(`❌ Erro inesperado: ${err.message}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Diagnóstico do Bucket</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Painel de controle */}
        <div className="p-6 border rounded-lg bg-white shadow-sm">
          <h2 className="text-xl font-bold mb-4">Controles de Diagnóstico</h2>
          
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col">
              <p className="text-sm text-gray-600 mb-2">
                Esta ferramenta executa testes passo a passo para diagnosticar problemas 
                de acesso ao bucket de armazenamento do Supabase.
              </p>
              <p className="text-sm text-gray-600">
                Bucket alvo: <code className="px-1 py-0.5 bg-gray-100 rounded">{BUCKET_NAME}</code>
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button 
                onClick={runDiagnostic} 
                disabled={testStatus === 'running'}
                className="relative"
              >
                {testStatus === 'running' ? (
                  <>
                    <span className="opacity-0">Executar diagnóstico completo</span>
                    <span className="absolute inset-0 flex items-center justify-center">
                      <div className="animate-spin h-5 w-5 border-t-2 border-b-2 border-white rounded-full"></div>
                    </span>
                  </>
                ) : (
                  'Executar diagnóstico completo'
                )}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={testUpload}
                disabled={testStatus === 'running'}
              >
                Testar upload
              </Button>
            </div>
          </div>
          
          {/* Resultados */}
          {testStatus === 'success' && (
            <Alert className="mb-4 bg-green-50 border-green-200">
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
              <AlertTitle>Todos os testes passaram!</AlertTitle>
              <AlertDescription>
                O bucket está configurado corretamente e acessível.
              </AlertDescription>
            </Alert>
          )}
          
          {testStatus === 'error' && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircleIcon className="h-5 w-5" />
              <AlertTitle>Erro no diagnóstico</AlertTitle>
              <AlertDescription>
                <p className="mb-2">{testError}</p>
                
                <div className="bg-red-50 p-4 rounded-md border border-red-200 mt-3">
                  <p className="font-medium text-red-800 mb-2">Sugestões:</p>
                  <ol className="list-decimal pl-5 space-y-1 text-red-700">
                    <li>Verifique se o nome do bucket está correto (sensitive a maiúsculas/minúsculas)</li>
                    <li>Confira as políticas RLS no Dashboard do Supabase:
                      <ul className="list-disc pl-5 mt-1 text-red-600">
                        <li>Política SELECT para listar arquivos</li>
                        <li>Política INSERT para upload</li>
                        <li>Política UPDATE se precisar atualizar arquivos</li>
                        <li>Política DELETE se precisar remover arquivos</li>
                      </ul>
                    </li>
                    <li>Certifique-se de que o bucket está definido como "público" se necessário</li>
                    <li>Verifique se as variáveis de ambiente estão corretas</li>
                  </ol>
                </div>
              </AlertDescription>
            </Alert>
          )}
          
          {/* Informações sobre buckets */}
          {buckets.length > 0 && (
            <div className="mt-4">
              <h3 className="text-md font-medium mb-2">Buckets detectados:</h3>
              <div className="grid grid-cols-1 gap-2">
                {buckets.map(bucket => (
                  <div 
                    key={bucket} 
                    className={`p-2 rounded border ${bucket === BUCKET_NAME ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}
                  >
                    {bucket} {bucket === BUCKET_NAME && <span className="text-green-600 font-medium">(bucket alvo)</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Arquivos */}
          {files.length > 0 && (
            <div className="mt-4">
              <h3 className="text-md font-medium mb-2">Arquivos no bucket ({files.length}):</h3>
              <div className="overflow-y-auto max-h-60 border rounded">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tamanho</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {files.map((file, index) => (
                      <tr key={index}>
                        <td className="px-3 py-2 whitespace-nowrap text-sm">{file.name}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm">
                          {typeof file.metadata?.size === 'number' 
                            ? formatFileSize(file.metadata.size) 
                            : (file.size ? formatFileSize(file.size) : '-')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
        
        {/* Logs de diagnóstico */}
        <div className="p-6 border rounded-lg bg-white shadow-sm">
          <h2 className="text-xl font-bold mb-4">Logs de Diagnóstico</h2>
          
          <div className="bg-gray-900 text-gray-100 p-4 rounded font-mono text-sm overflow-y-auto h-96">
            {logs.length === 0 ? (
              <div className="text-gray-500 italic">
                Clique em "Executar diagnóstico" para iniciar os testes...
              </div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className={`mb-1 ${log.includes('ERRO') ? 'text-red-400' : (log.includes('✅') ? 'text-green-400' : 'text-gray-300')}`}>
                  {log}
                </div>
              ))
            )}
            
            {testStatus === 'running' && (
              <div className="animate-pulse text-yellow-400 mt-1">
                Executando... 
              </div>
            )}
          </div>
          
          <div className="mt-4 text-sm text-gray-500">
            <p className="mb-2">Etapas do diagnóstico:</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li className={step >= 1 ? (step > 1 ? 'text-green-600' : 'text-blue-600 font-medium') : ''}>
                Iniciar diagnóstico
              </li>
              <li className={step >= 2 ? (step > 2 ? 'text-green-600' : 'text-blue-600 font-medium') : ''}>
                Listar todos os buckets
              </li>
              <li className={step >= 3 ? (step > 3 ? 'text-green-600' : 'text-blue-600 font-medium') : ''}>
                Verificar existência do bucket alvo
              </li>
              <li className={step >= 4 ? (step > 4 ? 'text-green-600' : 'text-blue-600 font-medium') : ''}>
                Listar arquivos do bucket (teste SELECT)
              </li>
              <li className={step >= 5 ? (step > 5 ? 'text-green-600' : 'text-blue-600 font-medium') : ''}>
                Fazer upload de arquivo de teste (teste INSERT)
              </li>
              <li className={step >= 6 ? (step > 6 ? 'text-green-600' : 'text-blue-600 font-medium') : ''}>
                Verificar se o arquivo foi adicionado
              </li>
              <li className={step >= 7 ? 'text-green-600 font-medium' : ''}>
                Diagnóstico concluído
              </li>
            </ol>
          </div>
        </div>
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