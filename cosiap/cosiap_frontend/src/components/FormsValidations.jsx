import * as Yup from "yup";

// Variable de formato para validación de formato de CURP
const CURP_REGEX =
  /^[A-Z]{1}[AEIOU]{1}[A-Z]{2}[0-9]{2}(0[1-9]|1[0-2])(0[1-9]|1[0-9]|2[0-9]|3[0-1])[HM]{1}(AS|BC|BS|CC|CH|CL|CM|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)[B-DF-HJ-NP-TV-Z]{3}[0-9A-Z]{1}[0-9]{1}$/;
//Variable de formato para validación de campo de RFC
const RFC_REGEX = /^([A-ZÑ&]{3,4})?(?:-)?([0-9]{2})(?:-)?(0[1-9]|1[0-2])(?:-)?([0-2][0-9]|3[0-1])(?:-)?([A-Z\d]{2})([A\d])$/;

// Validación de un campo CURP
const CURP_VALIDATION = Yup.string()
  .required("La CURP es requerida")
  .matches(CURP_REGEX, "Formato de CURP inválido");

// Validacion de un campo RFC
const RFC_VALIDATION = Yup.string()
  .required("El RFC es requerido")
  .matches(RFC_REGEX, "Formato de RFC inválido");

const PASSWORD_CREATION_VALIDATION = Yup.string()
  .required("La contraseña es requerida")
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .max(20, "La contraseña no puede tener más de 20 caracteres")
  .matches(/\d/, "Debe contener al menos un número")
  .matches(/[a-z]/, "Debe contener al menos una letra minúscula")
  .matches(/[A-Z]/, "Debe contener al menos una letra mayúscula")
  .matches(/[@$#¡!%*¿?&]/, "Debe contener al menos un carácter especial")
  .matches(/^\S*$/, "La contraseña no puede contener espacios");

const CONFIRM_PASSWORD_VALIDATION = Yup.string()
  .required("La confirmacion de la contraseña es requerida")
  .oneOf([Yup.ref("password"), null], "Las contraseñas no coinciden");

export const LoginValidationSchema = Yup.object().shape({
  curp: CURP_VALIDATION,
  password: Yup.string().required("La contraseña es requerida"),
});

export const RegisterValidationSchema = Yup.object({
  nombre: Yup.string()
    .required("El nombre es requerido")
    .min(3, "El nombre debe tener al menos 3 caracteres"),
  curp: CURP_VALIDATION,
  email: Yup.string()
    .required("El correo electronico es requerido")
    .email("El correo electronico no es válido"),
  password: PASSWORD_CREATION_VALIDATION,
  confirmar_password: CONFIRM_PASSWORD_VALIDATION,
});

export const ResetPasswordValidationSchema = Yup.object().shape({
  email: Yup.string()
    .required("El correo electronico es requerido")
    .email("El correo electronico no es válido"),
});

export const NewPasswordValidationSchema = Yup.object().shape({
  password: PASSWORD_CREATION_VALIDATION,
  confirmar_password: CONFIRM_PASSWORD_VALIDATION,
});

const FILE_SIZE = 5 * 1024 * 1024; // Tamaño máximo de archivo en bytes (5MB)
const SUPPORTED_FORMATS = ['application/pdf'];

export const PDF_FileValidation = Yup.mixed()
  .required("Este campo es requerido")
  .test("fileFormat", "Formato de archivo no soportado", (value) => value && SUPPORTED_FORMATS.includes(value.type)
  )
  .test("fileSize", "El archivo supera el tamaño máximo", (value) => value && value.size <= FILE_SIZE);

export const MontoValidation = Yup.number()
  .typeError("El monto debe ser un número válido")
  .required("El monto es requerido")
  .positive("El monto debe ser mayor a 0")
  .max(1000000, "El monto no puede ser muy grande");

export const FormValidationSchema = Yup.object({
  archivo: PDF_FileValidation,
  monto: MontoValidation,
});

export const PersonalInformationValidationSchema = Yup.object().shape({
    nombre: Yup.string()
        .required('El nombre es requerido'),
    ap_paterno: Yup.string()
        .required('El apellido paterno es requerido'),
    ap_materno: Yup.string(),
    sexo: Yup.string()
        .required('El sexo es requerido'),
    telefono: Yup.string()
        .required('El telefono es requerido')
        .matches(/^[0-9]{10}$/, 'El número debe tener 10 dígitos'),
    email: Yup.string()
        .required("El correo electronico es requerido")
        .email("El correo electronico no es válido")
});

export const DirectionInformationValidationSchema = Yup.object().shape({
  direccion : Yup.string().required('La dirección es requerida'),
  estado : Yup.string().required('El estado es requerido'),
  municipio : Yup.string().required('El municipio es requerido'),
  codigo_postal : Yup.string()
        .required('El código postal es requerido')
        .matches(/^[0-9]{5}$/, 'El código postal debe tener 5 dígitos'),
  poblacion : Yup.string().required("La población es requerida")
});


export const IdentificationValidationSchema = Yup.object().shape({
  RFC: RFC_VALIDATION,
  curp: CURP_VALIDATION,
  INE: Yup.mixed()
    .nullable() // Permite que sea un valor nulo o vacío
    .notRequired() // No es obligatorio
    .test(
      'fileFormat',
      'Solo se permiten archivos PDF',
      (value) => !value || (value[0] && value[0].type === 'application/pdf') // Valida solo si hay archivo
    ),
});

export const DatosBancariosValidationSchema = Yup.object().shape({
    nombre_banco: Yup.string()
        .required('El nombre del banco es obligatorio')
        .max(20, 'El nombre del banco no puede exceder los 20 caracteres'),
        
    cuenta_bancaria: Yup.string()
        .required('El número de cuenta es obligatorio')
        .matches(/^\d{10}$/, 'El número de cuenta debe tener 10 dígitos'),
        
    clabe_bancaria: Yup.string()
        .required('La CLABE bancaria es obligatoria')
        .matches(/^\d{16}$/, 'La CLABE bancaria debe tener 16 dígitos'),
        
    doc_estado_cuenta: Yup.mixed()
      .nullable() // Permite que sea un valor nulo o vacío
      .notRequired() // No es obligatorio
      .test(
        'fileFormat',
        'Solo se permiten archivos PDF',
        (value) => !value || (value[0] && value[0].type === 'application/pdf') // Valida solo si hay archivo
      ),
        
    doc_constancia_sat: Yup.mixed()
      .nullable() // Permite que sea un valor nulo o vacío
      .notRequired() // No es obligatorio
      .test(
        'fileFormat',
        'Solo se permiten archivos PDF',
        (value) => !value || (value[0] && value[0].type === 'application/pdf') // Valida solo si hay archivo
      ),
        
    codigo_postal_fiscal: Yup.string()
        .required('El código postal fiscal es obligatorio')
        .matches(/^\d{5}$/, 'El código postal debe tener 5 dígitos'),
        
    regimen: Yup.string()
        .required('El régimen fiscal es obligatorio')
        .oneOf([
            '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'
        ], 'Selecciona un régimen válido')
});
