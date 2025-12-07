import { DashboardModel } from '../../packages/core/src/index';

export async function buildTwoUpOneDown(model = new DashboardModel()) {
  await model.initialize();
  const only = model.getState().toArray()[0];
  await model.splitTile(only.id, { orientation: 'horizontal', ratio: 0.5 });
  const [top] = model
    .getState()
    .toArray()
    .sort((a, b) => a.y - b.y);
  await model.splitTile(top.id, { orientation: 'vertical', ratio: 0.5 });
  return model;
}
