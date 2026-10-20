/*
 * Brasões das unidades: um arquivo leve por unidade em assets/brasoes/,
 * carregado só quando a página precisa (antes eram 14 arquivos com todas
 * as imagens embutidas, baixados em toda página).
 */
(() => {
  const url = (caminho) => new URL(caminho, window.location.href).href;
  window.CENTRAL_LOGOS = Object.assign(window.CENTRAL_LOGOS || {}, {
    MUNICIPIO: url('assets/marca/brasao-tangara.webp'),
    'ESC-000003': url('assets/brasoes/ESC-000003.webp'),
    'ESC-000004': url('assets/brasoes/ESC-000004.webp'),
    'ESC-000005': url('assets/brasoes/ESC-000005.webp'),
    'ESC-000006': url('assets/brasoes/ESC-000006.webp'),
    'ESC-000007': url('assets/brasoes/ESC-000007.webp'),
    'ESC-000008': url('assets/brasoes/ESC-000008.webp'),
    'ESC-000009': url('assets/brasoes/ESC-000009.webp'),
    'ESC-000010': url('assets/brasoes/ESC-000010.webp'),
    'ESC-000011': url('assets/brasoes/ESC-000011.webp'),
    'ESC-000013': url('assets/brasoes/ESC-000013.webp'),
    'ESC-000014': url('assets/brasoes/ESC-000014.webp'),
    'ESC-000015': url('assets/brasoes/ESC-000015.webp'),
    'ESC-000016': url('assets/brasoes/ESC-000016.webp'),
    'ESC-000017': url('assets/brasoes/ESC-000017.webp'),
    'ESC-000018': url('assets/brasoes/ESC-000018.webp'),
    'ESC-000019': url('assets/brasoes/ESC-000019.webp'),
    'ESC-000020': url('assets/brasoes/ESC-000020.webp'),
    'ESC-000021': url('assets/brasoes/ESC-000021.webp'),
    'ESC-000022': url('assets/brasoes/ESC-000022.webp'),
    'ESC-000023': url('assets/brasoes/ESC-000023.webp'),
    'ESC-000025': url('assets/brasoes/ESC-000025.webp'),
    'ESC-000026': url('assets/brasoes/ESC-000026.webp'),
    'ESC-000027': url('assets/brasoes/ESC-000027.webp'),
    'ESC-000028': url('assets/brasoes/ESC-000028.webp'),
    'ESC-000029': url('assets/brasoes/ESC-000029.webp'),
    'ESC-000030': url('assets/brasoes/ESC-000030.webp'),
    'ESC-000031': url('assets/brasoes/ESC-000031.webp'),
    'ESC-000032': url('assets/brasoes/ESC-000032.webp'),
    'ESC-000033': url('assets/brasoes/ESC-000033.webp'),
    'ESC-000034': url('assets/brasoes/ESC-000034.webp'),
    'ESC-000036': url('assets/brasoes/ESC-000036.webp'),
    'ESC-000039': url('assets/brasoes/ESC-000039.webp'),
    'ESC-000041': url('assets/brasoes/ESC-000041.webp'),
    'ESC-000044': url('assets/brasoes/ESC-000044.webp'),
    'ESC-000051': url('assets/brasoes/ESC-000051.webp'),
    'INDIGENA': url('assets/brasoes/INDIGENA.webp')
  });
})();
