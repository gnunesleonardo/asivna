const anvisaApi = 'https://consultas.anvisa.gov.br/api/documento/tecnico/expediente';
const hrefExpediente = 'https://consultas.anvisa.gov.br/#/documentos/tecnicos/expediente';
const corsAnywhereApi = 'https://cors-anywhere.herokuapp.com';
const mockyApi = 'https://run.mocky.io/v3/cd97bfdd-10bb-42b6-9e3e-4886b7b09623';

const setProgressBarPercentage = (percentage) => {
  $('.progress-bar').css('width', `${percentage}%`);
  $('.progress-bar').html(`${percentage}%`);
}

const clearProgressBar = () => {
  $('.progress-bar').css('width', '0%');
  $('.progress-bar').html('0%');
}

const showLoadingAnimation = () => {
  $('#load-ani').show();
  clearProgressBar();
};

const hideLoadingAnimation = () => {
  $('#load-ani').hide();
  clearProgressBar();
}

const clearTableBody = () => {
  $('#table > tbody').empty();
};

const createTableRow = (expediente, situacao, data, gerencia) => {
  const href = `${hrefExpediente}/${expediente}/`;
  $('#table > tbody').append(`
    <tr>
      <td><a href=${href} target="_blank">${expediente}</a></td>
      <td>${situacao}</td>
      <td>${data}</td>
      <td>${gerencia}</td>
    </tr>
  `);
}

const getAllUrls = async (urls) => {
  const length = urls.length;
  const data = await Promise.all(
    urls.map((url, index) => fetch(url, {
      method: 'GET',
      headers: {
        'Origin': 'https://consultas.anvisa.gov.br/',
        'Authorization': 'Guest'
      }
    })
      .then(response => response.json())
      .catch(err => {
        console.error(err);
        return false;
      })
      .finally(() => {
        const percentage = (((index) / length) * 100).toFixed(0);
        setProgressBarPercentage(percentage);
      })
    )
  );

  return data;
};

$('#send-btn').on('click', async (event) => {
  event.stopPropagation();
  const inputTokens = $('#tokenfield').tokenfield('getTokens');

  if (!inputTokens.length) {
    window.alert('Nº do Expediente Vazio');
  } else {
    const urlsArray = [];
    showLoadingAnimation();

    inputTokens.forEach(token => {
      const expediente = token.value.replace(/[^\w\s]/gi, '');
      const url = `${corsAnywhereApi}/${anvisaApi}/${expediente}`;
      urlsArray.push(url);
    });

    const expData = await getAllUrls(urlsArray);
    clearTableBody();
    expData.forEach((exp) => {
      if (exp) {
        const expediente = exp.peticoes[0].expediente;
        const situacao = exp.peticoes[0].situacao.descricao;
        const gerencia = `${exp.peticoes[0].area.sigla} - ${exp.peticoes[0].area.nome}`;
        const data = moment(exp.peticoes[0].area.recebimento).format('DD/MM/YYYY');
        createTableRow(expediente, situacao, gerencia, data);
      }
    });
    hideLoadingAnimation();
  }
});

$('document').ready(() => {
  $('#tokenfield').tokenfield({});
});