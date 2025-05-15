// app/components/ui/sonner.tsx - Versão simplificada para garantir funcionamento
import { useTheme } from "next-themes"
import { toast, Toaster as SonnerToaster } from "sonner"

// Componente Toaster simplificado
const Toaster = ({ ...props }) => {
  const { theme = "system" } = useTheme()

  return (
    <SonnerToaster
      theme={theme as any}
      richColors
      closeButton
      position="top-right"
      duration={4000}
      visibleToasts={3}
      {...props}
    />
  )
}

// Funções de toast simplificadas
const toastSuccess = (title: string, description?: string) => {
  toast.success(title, { description });
};

const toastError = (title: string, description?: string) => {
  toast.error(title, { description });
};

const toastInfo = (title: string, description?: string) => {
  toast.info(title, { description });
};

export { Toaster, toast, toastSuccess, toastError, toastInfo };