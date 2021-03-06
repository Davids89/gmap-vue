import mapElementFactory from '../factories/map-element';

const props = {
  draggable: {
    type: Boolean,
  },
  editable: {
    type: Boolean,
  },
  options: {
    twoWay: false,
    type: Object,
  },
  path: {
    type: Array,
    twoWay: true,
  },
};

const events = [
  'click',
  'dblclick',
  'drag',
  'dragend',
  'dragstart',
  'mousedown',
  'mousemove',
  'mouseout',
  'mouseover',
  'mouseup',
  'rightclick',
];

export default mapElementFactory({
  mappedProps: props,
  props: {
    deepWatch: {
      type: Boolean,
      default: false,
    },
  },
  events,

  name: 'polyline',
  ctr: () => google.maps.Polyline,

  // TODO: analyze, we remove the reference of the component instance
  afterCreate() {
    let clearEvents = () => {};

    this.$watch(
      'path',
      (path) => {
        if (path) {
          clearEvents();

          this.$polylineObject.setPath(path);

          const mvcPath = this.$polylineObject.getPath();
          const eventListeners = [];

          const updatePaths = () => {
            this.$emit('path_changed', this.$polylineObject.getPath());
          };

          eventListeners.push([
            mvcPath,
            mvcPath.addListener('insert_at', updatePaths),
          ]);
          eventListeners.push([
            mvcPath,
            mvcPath.addListener('remove_at', updatePaths),
          ]);
          eventListeners.push([
            mvcPath,
            mvcPath.addListener('set_at', updatePaths),
          ]);

          clearEvents = () => {
            // TODO: analyze, we change map to forEach because clearEvents is a void function and the returned array is not used
            eventListeners.forEach(([, listenerHandle]) => {
              google.maps.event.removeListener(listenerHandle);
            });
          };
        }
      },
      {
        deep: this.deepWatch,
        immediate: true,
      }
    );
  },
});
