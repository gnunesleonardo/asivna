const tableBody = $('#table > tbody')[0];
const tableHead = $('#table > thead')[0];
const corsAnywhereApi = 'https://cors-anywhere.herokuapp.com';
const anvisaApi = 'https://consultas.anvisa.gov.br/api/documento/tecnico/expediente';
const finalEndpoint = `${corsAnywhereApi}/${anvisaApi}`;
const mockyApi = 'https://run.mocky.io/v3/cd97bfdd-10bb-42b6-9e3e-4886b7b09623';

const clearTableBody = () => tableBody.innerHTML = '';
const showLoadingAnimation = () => $('#load-spinner').show();
const hideLoadingAnimation = () => $('#load-spinner').hide();
const createTableRow = (expediente, situacao) => {
  const href = `https://consultas.anvisa.gov.br/#/documentos/tecnicos/expediente/${expediente}/`;
  tableBody.innerHTML += `
    <tr>
      <td><a href=${href} target="_blank">${expediente}</a></td>
      <td>${situacao}</td>
    </tr>
  `;
}

$('#send-btn').on('click', async (event) => {
  event.stopPropagation();
  const inputTokens = $('#tokenfield').tokenfield('getTokens');
  if (!inputTokens.length)
    window.alert('Nº do Expediente Vazio');
  else {
    clearTableBody();
    showLoadingAnimation();
    try {
      for (token of inputTokens) {
        const expediente = token.value;
        const res = await fetch(`${finalEndpoint}/${expediente}`, {
          method: 'GET',
          headers: {
            'Origin': 'https://consultas.anvisa.gov.br/',
            'Authorization': 'Guest'
          }
        });

        if (res.status === 200) {
          const data = await res.json();
          const situacao = data.peticoes[0].situacao.descricao;
          createTableRow(expediente, situacao);
        }
      }
    } catch (err) {
      console.log('[error]', token.value);
      createTableRow(expediente, 'ERRO');
    } finally {
      hideLoadingAnimation();
    }
  }
});

(async () => {
  $('#tokenfield').tokenfield({});
})();