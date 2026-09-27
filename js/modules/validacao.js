// Regras de validação que o HTML sozinho não consegue fazer

// confere os dois dígitos verificadores do CPF
export function cpfValido(valor) {
  const numeros = valor.replace(/\D/g, '');

  if (numeros.length !== 11) return false;
  // 111.111.111-11, 222... passam na conta mas nao existem
  if (/^(\d)\1{10}$/.test(numeros)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += Number(numeros[i]) * (10 - i);
  }
  let digito1 = (soma * 10) % 11;
  if (digito1 === 10) digito1 = 0;
  if (digito1 !== Number(numeros[9])) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += Number(numeros[i]) * (11 - i);
  }
  let digito2 = (soma * 10) % 11;
  if (digito2 === 10) digito2 = 0;

  return digito2 === Number(numeros[10]);
}

// data maxima de nascimento para ter a idade minima (formato AAAA-MM-DD)
export function dataMaximaParaIdade(anos) {
  const hoje = new Date();
  const limite = new Date(hoje.getFullYear() - anos, hoje.getMonth(), hoje.getDate());
  return limite.toISOString().split('T')[0];
}

// lista os campos invalidos do formulario (radios do mesmo grupo contam uma vez)
export function camposInvalidos(form) {
  const nomes = new Set();
  Array.from(form.elements).forEach(function (campo) {
    if (campo.willValidate && !campo.validity.valid) {
      nomes.add(campo.name);
    }
  });
  return nomes;
}
