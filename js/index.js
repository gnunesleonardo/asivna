const anvisaApi = 'https://consultas.anvisa.gov.br/api/documento/tecnico/expediente';
const hrefExpediente = 'https://consultas.anvisa.gov.br/#/documentos/tecnicos/expediente';
const corsAnywhereApi = 'https://cors-anywhere.herokuapp.com';
const mockyApi = 'https://run.mocky.io/v3/cd97bfdd-10bb-42b6-9e3e-4886b7b09623';

const setProgressBarPercentage = (length) => {
  const value = parseInt($('.progress-bar').attr('aria-valuenow'));
  const percentage = (((value) / length) * 100).toFixed(0);

  $('.progress-bar').attr('aria-valuenow', (value + 1));
  $('.progress-bar').css('width', `${percentage}%`);
  $('.progress-bar').html(`${percentage}%`);
}

const clearProgressBar = () => {
  $('.progress-bar').attr('aria-valuenow', 1);
  $('.progress-bar').css('width', '0%');
  $('.progress-bar').html('0%');
}

const showLoadingAnimation = () => {
  $('#load-ani').show();
  clearProgressBar();
};

const changeLoadingAnimationText = (text) => {
  $('#load-ani > .text-center').text(text);
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

const getAllExpUrls = (expGetArr) => {
  const length = expGetArr.length;
  const data = Promise.all(
    expGetArr.map((exp) => fetch(exp.url, {
      method: 'GET',
      headers: {
        'Origin': 'https://consultas.anvisa.gov.br/',
        'Authorization': 'Guest'
      }
    })
      .then(async response => {
        return {
          expediente: exp.expediente,
          response: await response.json(),
        }
      })
      .catch(error => {
        console.error(error);
        return {
          expediente: exp.expediente,
          response: false
        }
      })
      .finally(() => {
        setProgressBarPercentage(length);
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
    return null;
  }

  const expGetArr = [];
  changeLoadingAnimationText('Carregando...');
  showLoadingAnimation();

  inputTokens.forEach(token => {
    const expediente = token.value.replace(/[^\w\s]/gi, '');
    const url = `${corsAnywhereApi}/${anvisaApi}/${expediente}`;
    expGetArr.push({
      url: mockyApi,
      expediente
    });
  });

  const expData = await getAllExpUrls(expGetArr);
  let [successExp, errorExp] = [[], []];
  expData.forEach(exp => {
    if (exp.response)
      successExp.push(exp.response);
    else
      errorExp.push(exp.expediente);
  });

  clearTableBody();
  successExp.forEach((exp) => {
    const expediente = exp.peticoes[0].expediente;
    const situacao = exp.peticoes[0].situacao.descricao;
    const gerencia = `${exp.peticoes[0].area.sigla} - ${exp.peticoes[0].area.nome}`;
    const data = moment(exp.peticoes[0].area.recebimento || exp.peticoes[0].area.remessa).format('DD/MM/YYYY');
    createTableRow(expediente, situacao, gerencia, data);
  });
  changeLoadingAnimationText('Concluído');
  
  if (errorExp.length)
    window.alert(`Expediente(s) não encontrados:\n${errorExp}`);
});

$('document').ready(() => {
  $('#tokenfield').tokenfield({});
});