import os
from agno.agent import Agent
from agno.models.openai import OpenAIResponses
from models.schemas import AgentAnalysisResult, TransactionFromAgent
from core.config import settings


def analisar_extrato(
    conteudo_texto: str,
    categorias: list[str],
) -> list[TransactionFromAgent]:
    """
    Envia o conteúdo do extrato ao agente AGNO e retorna as transações estruturadas.
    Usa output_schema para garantir resposta Pydantic validada (API correta do AGNO 1.x).
    """
    os.environ["OPENAI_API_KEY"] = settings.openai_api_key

    categorias_str = ", ".join(categorias) if categorias else "Alimentação, Transporte, Moradia, Saúde, Lazer, Streaming, Salário, Outros"

    agent = Agent(
        model=OpenAIResponses(id="gpt-4o-mini"),
        description=(
            "Você é um assistente financeiro especializado em análise de extratos bancários brasileiros. "
            "Analise o extrato fornecido e extraia todas as transações de forma estruturada."
        ),
        instructions=[
            f"Use SOMENTE estas categorias disponíveis: {categorias_str}",
            "Para cada transação, identifique: data (YYYY-MM-DD), descrição, débito ou crédito (nunca os dois), e categoria.",

            # Detecção de parcelamento
            "PARCELADO: marque tipo_recorrencia='parcelado' quando a descrição contiver padrões como: "
            "'PARC', 'PARCELA', 'PARCELADO', 'PCEL', '2/12', '03/12', '3 DE 12', 'P 2/6', 'PARC 3/10', "
            "ou qualquer combinação de número/número que indique parcela atual e total. "
            "Preencha parcela_atual (número antes da barra) e parcelas_total (número depois da barra).",

            # Detecção de assinaturas
            "SUBSCRIPTION: marque tipo_recorrencia='subscription' quando a descrição contiver nomes de "
            "serviços de assinatura como: NETFLIX, SPOTIFY, AMAZON PRIME, AMAZON VIDEO, DISNEY+, DISNEY PLUS, "
            "HBO MAX, GLOBOPLAY, DEEZER, YOUTUBE PREMIUM, APPLE ONE, APPLE TV, APPLE MUSIC, ICLOUD, "
            "MICROSOFT 365, OFFICE 365, ADOBE, CANVA, CHATGPT, OPENAI, GOOGLE ONE, DROPBOX, NOTION, "
            "DUOLINGO, LINKEDIN PREMIUM, CRUNCHYROLL, MUBI, PARAMOUNT+, STAR+, TELECINE, CLARO NET, "
            "VIVO, TIM, OI, CLARO, NEXTEL, PLANO MENSAL, MENSALIDADE, ASSINATURA, SUBSCRIPTION. "
            "Tente identificar o dia do mês em que a cobrança ocorre e preencha dia_cobranca.",

            "Valores de débito e crédito devem ser POSITIVOS (nunca negativos).",
            "Se não conseguir identificar uma categoria, use 'Outros'.",
            "Extraia TODAS as transações do extrato, sem pular nenhuma.",
        ],
        output_schema=AgentAnalysisResult,
    )

    prompt = f"Analise o seguinte extrato bancário e extraia todas as transações:\n\n{conteudo_texto}"

    response = agent.run(prompt)
    result: AgentAnalysisResult = response.content  # type: ignore[assignment]
    return result.transacoes
