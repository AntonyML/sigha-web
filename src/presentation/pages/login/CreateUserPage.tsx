import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle, AlertCircle, Mail, Phone, MessageSquare, User } from 'lucide-react';
import { ButtonNew as Button } from '../../components';
import { Input } from '../../components/atoms';
import { AuthLayout } from '../../components/molecules';
import { userRequestFlow, type UserRequestFormData } from '../../../infrastructure/flows';

export default function CreateUserPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<UserRequestFormData>({
    fullName: '',
    email: '',
    phone: '',
    reason: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof UserRequestFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null);

  const validateField = (name: keyof UserRequestFormData, value: string): string | null => {
    switch (name) {
      case 'fullName': {
        const trimmed = value.trim();
        if (!trimmed) return 'El nombre completo es requerido.';
        if (trimmed.length < 2) return 'El nombre debe tener al menos 2 caracteres.';
        if (trimmed.length > 200) return 'El nombre no puede exceder 200 caracteres.';
        return null;
      }
      case 'email': {
        const trimmed = value.trim();
        if (!trimmed) return 'El correo electrónico es requerido.';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmed)) return 'El correo electrónico no tiene un formato válido.';
        if (trimmed.length > 256) return 'El correo no puede exceder 256 caracteres.';
        return null;
      }
      case 'phone': {
        const trimmed = value.trim();
        if (!trimmed) return 'El teléfono es requerido.';
        if (trimmed.length > 30) return 'El teléfono no puede exceder 30 caracteres.';
        return null;
      }
      case 'reason': {
        const trimmed = value.trim();
        if (!trimmed) return 'El motivo de la solicitud es requerido.';
        if (trimmed.length < 10) return 'El motivo debe tener al menos 10 caracteres.';
        if (trimmed.length > 2000) return 'El motivo no puede exceder 2000 caracteres.';
        return null;
      }
      default:
        return null;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error on change
    const error = validateField(name as keyof UserRequestFormData, value);
    setErrors(prev => ({ ...prev, [name]: error || undefined }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const error = validateField(name as keyof UserRequestFormData, value);
    setErrors(prev => ({ ...prev, [name]: error || undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const newErrors: Partial<Record<keyof UserRequestFormData, string>> = {};
    (Object.keys(formData) as Array<keyof UserRequestFormData>).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    setSubmitResult(null);

    try {
      const result = await userRequestFlow.submitRequest(formData);
      setSubmitResult(result);
      if (result.success) {
        // Reset form on success
        setFormData({ fullName: '', email: '', phone: '', reason: '' });
      }
    } catch {
      setSubmitResult({
        success: false,
        error: 'Error inesperado. Por favor, intenta de nuevo.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (!isSubmitting && !submitResult?.success) {
      navigate('/login');
    }
  };

  // Success state
  if (submitResult?.success) {
    return (
      <AuthLayout
        title="Solicitud Enviada"
        description=""
        showBackButton={true}
        onBackClick={handleBack}
        backButtonText="Volver al inicio de sesión"
      >
        <div className="space-y-4 text-center">
          <div className="p-6 rounded-lg bg-green-50 border border-green-200">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-green-800 mb-2">Solicitud enviada correctamente</h3>
            <p className="text-green-700 mb-4">
              {submitResult.message || 'Tu solicitud fue enviada. Un administrador la revisará pronto.'}
            </p>
            <p className="text-sm text-green-600">
              Serás redirigido al inicio de sesión en unos segundos.
            </p>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Solicitar Cuenta"
      description="Completa el formulario para solicitar la creación de tu cuenta de usuario"
      showBackButton={true}
      onBackClick={handleBack}
      backButtonText="Volver al inicio de sesión"
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="space-y-2">
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
            Nombre completo <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="Tu nombre completo"
              value={formData.fullName}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`pl-10 ${errors.fullName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              disabled={isSubmitting}
              autoComplete="name"
            />
          </div>
          {errors.fullName && (
            <p className="text-sm text-red-500" role="alert">{errors.fullName}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Correo electrónico <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="tu@ejemplo.com"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`pl-10 ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              disabled={isSubmitting}
              autoComplete="email"
            />
          </div>
          {errors.email && (
            <p className="text-sm text-red-500" role="alert">{errors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Teléfono <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="+506 8888-1111"
              value={formData.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`pl-10 ${errors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              disabled={isSubmitting}
              autoComplete="tel"
            />
          </div>
          {errors.phone && (
            <p className="text-sm text-red-500" role="alert">{errors.phone}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
            Motivo de la solicitud <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <textarea
              id="reason"
              name="reason"
              placeholder="Explica por qué necesitas una cuenta (ej. soy enfermero y necesito registrar atenciones, soy familiar de un residente, etc.)"
              value={formData.reason}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.reason ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
              disabled={isSubmitting}
              rows={4}
            />
          </div>
          {errors.reason && (
            <p className="text-sm text-red-500" role="alert">{errors.reason}</p>
          )}
          <p className="text-xs text-gray-500 text-right">
            {formData.reason.trim().length}/2000 caracteres
          </p>
        </div>

        {submitResult?.error && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200" role="alert">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">{submitResult.error}</p>
            </div>
          </div>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12 text-base font-semibold"
          size="lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Enviando solicitud...
            </>
          ) : (
            'Enviar solicitud'
          )}
        </Button>

        <p className="text-xs text-center text-gray-500">
          Un administrador revisará tu solicitud y te contactará al correo proporcionado.
        </p>
      </form>
    </AuthLayout>
  );
}