# Roadmap

## Current phase
Prototype first.

## Current step
[x]Homepage scaffold.
[] Alojamento page scaffold

## Small changes to implement next
The dropdown for languages still looks native, so need to change it from the native select.
In wide screens the layout is very unconsistent : titles can be huge, certain things are centered, others are aligned to the left, places where it is cards don't stay in pairs or triplets so there's just gaps. I like the center alignement, although the occasional image for example for the hero that goes from side to side of the page fits well, carroussels could also be half fade-out when going too far away from the center of the page.
In alojamento.html I want the rules to pop out, so maybe some bold words or even some red words to make sure they are read. 
 

Create galeria.html:
Very simple, it just lays down every single image in the assets/images (no subfolders) (I don't know if it's possible to do it automatically, so not every time an image is added its name needs to be added manually). The layout takes the images shape and lays it down automatically filling all the gaps, and the entire page, almost puzzle like, if any image is clicked it opens a sort of caroussel pop-up, where the images can be zoomed in. There's the Reservar floating button as well when not in caroussel mode

## Small additions to not forget
Change default language based on browser defaults

## RULES
"rules_full": {
  "eyebrow": "Regras e condições",
  "title": "Condições da estadia",

  "capacity": {
    "title": "Capacidade e ocupação",
    "item1": "Capacidade máxima: 6 hóspedes",
    "item2": "Não é permitido exceder o número de hóspedes reservados",
    "item3": "O cumprimento será verificado através de câmaras exteriores",
    "note": "O incumprimento poderá resultar na intervenção das autoridades e numa coima entre 500€ e 2500€."
  },

  "checkin": {
    "title": "Check-in e check-out",
    "item1": "Check-in: 15h00 – 19h00",
    "item2": "Check-out: 08h00 – 10h00",
    "item3": "Deve indicar a hora de chegada e saída com pelo menos 48h de antecedência",
    "item4": "Horários fora destes períodos podem ser possíveis mediante contacto prévio",
    "note": "Poderão ser aplicadas taxas adicionais fora do horário definido."
  },

  "reservation": {
    "title": "Reserva e cancelamento",
    "item1": "Cancelamento gratuito até 48h antes do horário de check-in",
    "item2": "Após esse prazo, será cobrado o valor total da estadia",
    "item3": "A reserva implica a aceitação de todas as condições"
  },

  "deposit": {
    "title": "Depósito de segurança",
    "item1": "Depósito a partir de 200€ pago em numerário no check-in",
    "item2": "O valor pode variar consoante o número de hóspedes ou circunstâncias",
    "item3": "Reembolsado no check-out após verificação do espaço",
    "item4": "Recomendamos considerar o tempo de verificação no momento da saída"
  },

  "identification": {
    "title": "Identificação",
    "item1": "Documento de identificação obrigatório para todos os hóspedes",
    "item2": "Os dados poderão ser registados para fins legais e de segurança"
  },

  "parking": {
    "title": "Estacionamento",
    "item1": "Estacionamento gratuito e vigiado disponível",
    "item2": "Não é permitido estacionar dentro da propriedade (apenas cargas e descargas)",
    "note": "Danos ou resíduos causados por veículos poderão ser descontados no depósito"
  },

  "rules": {
    "title": "Regras de utilização",
    "item1": "PROIBIDAS festas ou eventos de qualquer tipo",
    "item2": "Especialmente proibidas despedidas de solteiro(a) e festas de aniversário",
    "item3": "A propriedade destina-se a descanso e tranquilidade",
    "item4": "Não são permitidos animais de estimação"
  },

  "smoking": {
    "title": "Política de fumadores",
    "item1": "Proibido fumar no interior de todos os edifícios",
    "item2": "Permitido apenas nas zonas exteriores indicadas",
    "note": "O incumprimento pode implicar custos adicionais e riscos de incêndio."
  },

  "cleaning": {
    "title": "Utilização e limpeza",
    "item1": "Todos os utensílios devem ser lavados após utilização",
    "item2": "Devem ser colocados novamente no seu local",
    "note": "O não cumprimento poderá implicar custos adicionais de limpeza."
  },

  "pool": {
    "title": "Piscina",
    "item1": "Piscina disponível na estação quente",
    "item2": "Inclui boias e acessórios de lazer",
    "note": "A utilização é da inteira responsabilidade dos hóspedes."
  },

  "security": {
    "title": "Segurança e videovigilância",
    "item1": "A propriedade dispõe de câmaras de segurança",
    "item2": "Durante a estadia, apenas as câmaras exteriores estão ativas",
    "item3": "As câmaras interiores encontram-se desativadas",
    "item4": "Sistema com alarmes, detetores de fumo e extintores",
    "note": "As câmaras existem exclusivamente para segurança da propriedade."
  },

  "legal": {
    "title": "Informação legal",
    "item1": "Licença de Alojamento Local: 132647/AL",
    "item2": "Faturas com NIF disponíveis mediante pedido"
  },

  "languages": {
    "title": "Idiomas",
    "item1": "Português",
    "item2": "Francês",
    "item3": "Inglês",
    "item4": "Espanhol"
  }
}