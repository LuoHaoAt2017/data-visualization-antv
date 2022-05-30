import { useEffect } from 'react';
import { Chart } from '@antv/g2';

import styles from './index.less';

const chartW = 800;
const chartH = 800;

const CustomLabel = () => {
  useEffect(() => {
    const chart = new Chart({
      container: 'container',
      autoFit: false,
      width: chartW,
      height: chartH,
      padding: [60, 60, 60, 60],
      renderer: 'svg',
    });
    const data = [
      { type: '汽车', value: 34 },
      { type: '建材家居', value: 85 },
      { type: '住宿旅游', value: 103 },
      { type: '交通运输与仓储邮政', value: 142 },
      { type: '建筑房地产', value: 251 },
      { type: '教育', value: 367 },
      { type: 'IT 通讯电子', value: 491 },
      { type: '社会公共管理', value: 672 },
      { type: '医疗卫生', value: 868 },
      { type: '金融保险', value: 1234 },
    ];
    chart.interval().position('type*value').label('value', {
      position: 'middle',
    });
    chart.coordinate().transpose();
    chart.data(data);
    chart.render();
  }, []);

  return <div className={styles.container} id="container"></div>;
};

export default CustomLabel;
