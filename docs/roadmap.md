# Roadmap

## Current phase
Prototype first.

## Current step
[x]Homepage scaffold.
[] Alojamento page scaffold

## Small changes to implement next
index.html fixes:
The space between the titles and the paragraphs should be the same everywhere, I like the spacing in the hero, so make that the standard
The caroussels should not have a vertical scrollbar and scroll option
Clicking on any sponsor partners should for now open the Guia Local, later it will open directly on the part of the Guia Local that talks about said partner

Everywhere:
The language dropdown menu doesn't follow the same style as the menu dropdown.
Since the header and footer are in every page, shouldn't there be a centralised way to calling it, instead of copy pasting it each page and need to change it in each page every time a change is made?
Images that are not buttons should not have a scale up animation like buttons do.

Alojamento.js:
The css style should remain consistent between multiple pages (make sure the alojamento.js uses the same rules as the index.html homepage, that should be in a general file. Right now I feel like the spaces between elements, the hero, and the title styling is not the same, it's ok to have differences (like the Resevar box here), but simple stuff like the title small text combo should be consistent)
Make sure the pt.json file is well organised, as in general stuff that appears multiple time could be it's own thing, and then each page's text should be clearly separated to easier readability and changes to be done. Make sure the content of the pt.json are also as the default fallback in the alojamento.html page (and fix any changes with this in index.html as well), the correct/updated text is the one in pt.json --> there's text in the pt.json that was added to it and not the page, make sure all the text from pt.json is in the html page
The image under casa privdad is too big, it should be more alongated, less tall
The cards under the Spaces should be a caroussel instead, so the people have an image and a description of everything described above. Maybe we can make two carroussels since there's lots of stuff, we can separate it between interior and exterior, properly titeled or even separated by the paragraphs that mention it if it makes for a better UI. Fix the card numbers too, depending on how you make the carroussels. Add a "Ver galeria completa" button after that.
The amanities section could be more compact, it's more of a list type thing, the fonts could be smaller, the spaces reduced, still feel luxurious and mobile-friendly, but don't need to be readable from a distance and catchy



Create galeria.html:
Very simple, it just lays down every single image in the assets/images (no subfolders) (I don't know if it's possible to do it automatically, so not every time an image is added its name needs to be added manually). The layout takes the images shape and lays it down automatically filling all the gaps, and the entire page, almost puzzle like, if any image is clicked it opens a sort of caroussel pop-up, where the images can be zoomed in. There's the Reservar floating button as well when not in caroussel mode

## Small additions to not forget
Change default language based on browser defaults

The contract button should be easily findable, visible in all pages, maybe in the header and the footer permenently (reduced to a cell or email icon if not enough space?)

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