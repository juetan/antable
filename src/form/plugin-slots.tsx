// import { useSlots } from 'vue'
// import { AnForm } from './form'

// declare module './form' {
//   interface UseFormOptionTemplateSlots {
//     itemSlotsOntup: boolean
//     setterSlotsOnSetup: boolean
//   }
//   interface AnFormState {
//     templateSlots: UseFormOptionTemplateSlots
//   }
//   interface AnFormConfig {
//     templateSlots: UseFormOptionTemplateSlots
//   }
// }

// function mapItemSlots(form: AnForm) {
//   const state = form.getState()
//   const model = state.form.formProps.model
//   const slots = useSlots()
//   for (const item of state.form.rawItems) {
//     if (!item.field) {
//       return
//     }
//     const itemSlots = item.itemSlots!
//     const defaultSlot = slots[`item:${item.field}`]
//     const helpSlot = slots[`item:${item.field}:help`]
//     const iconSlot = slots[`item:${item.field}:icon`]
//     const extraSlot = slots[`item:${item.field}:extra`]
//     if (defaultSlot) {
//       itemSlots.default = () => defaultSlot(item, model)
//     }
//     if (helpSlot) {
//       itemSlots.help = () => helpSlot(item, model)
//     }
//     if (iconSlot) {
//       itemSlots.icon = () => iconSlot(item, model)
//     }
//     if (extraSlot) {
//       itemSlots.extra = () => extraSlot(item, model)
//     }
//   }
// }

// function mapSetterSlots(form: AnForm) {
//   console.log(form)
// }

// export function formTemplateSlotsPlugin(form: AnForm) {
//   const state = form.getState()

//   form.hook('setup', () => {
//     const { itemSlotsOntup, setterSlotsOnSetup } = state.templateSlots
//     if (itemSlotsOntup) {
//       mapItemSlots(form)
//     }
//     if (setterSlotsOnSetup) {
//       mapSetterSlots(form)
//     }
//   })
// }
