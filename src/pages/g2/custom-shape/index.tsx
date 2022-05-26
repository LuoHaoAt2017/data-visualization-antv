import React, { useEffect } from 'react';
import { connect } from 'dva';
import { useDispatch } from 'umi';
import { Chart } from '@antv/g2';

const CustomShape = ({ dutyList }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch({
      type: 'DutyModel/getDutyList',
    });
  }, []);

  console.log(dutyList);
  return <>CustomShape</>;
};

export default connect(({ DutyModel }) => {
  return {
    dutyList: DutyModel.dutyList,
  };
})(CustomShape);
