// Máscaras de entrada: recebem o texto digitado e devolvem formatado

export function mascaraCPF(valor) {
  valor = valor.replace(/\D/g, '').slice(0, 11);
  valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
  valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
  valor = valor.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  return valor;
}

export function mascaraTelefone(valor) {
  valor = valor.replace(/\D/g, '').slice(0, 11);

  if (valor.length > 10) {
    // celular: (81) 99999-9999
    return valor.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
  } else if (valor.length > 6) {
    // fixo: (81) 3333-4444
    return valor.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3');
  } else if (valor.length > 2) {
    return valor.replace(/^(\d{2})(\d+)$/, '($1) $2');
  } else if (valor.length > 0) {
    return '(' + valor;
  }
  return valor;
}

export function mascaraCEP(valor) {
  valor = valor.replace(/\D/g, '').slice(0, 8);
  return valor.replace(/^(\d{5})(\d)/, '$1-$2');
}
