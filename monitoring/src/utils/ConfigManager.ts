import type { Config, T_Config } from '../types';
import { mainCheck as mainCheckAus } from '../check-page/aus';
import { mainCheck as mainCheckCCPA } from '../check-page/ccpa';
import { mainCheck as mainCheckTcfV2 } from '../check-page/tcfv2';
import { E_Jurisdiction, E_Stage } from '../enums';



class ConfigManager {

	static getEnvConfig = (stage: E_Stage, jurisdiction: E_Jurisdiction) : T_Config => {
		switch(jurisdiction){
			case E_Jurisdiction.AUS:
				return ConfigManager.getAus(stage);
			case E_Jurisdiction.TCFV2:
				return ConfigManager.getTcfv(stage);
			case E_Jurisdiction.CCPA:
				return ConfigManager.getCCPA(stage);
		}
	}


	private static getAus = (stage: E_Stage) : T_Config => {
		switch(stage){
			case E_Stage.CODE:
				return ConfigAusCode;
			case E_Stage.PROD:
				return ConfigAusProd;
		}
	}

	private static getTcfv = (stage: E_Stage) : T_Config => {
		switch(stage){
			case E_Stage.CODE:
				return ConfigTcfv2Code;
			case E_Stage.PROD:
				return ConfigTcfv2Prod;
		}
	}

	static getCCPA = (stage: E_Stage) : T_Config => {
		switch(stage){
			case E_Stage.CODE:
				return ConfigCCPACode;
			case E_Stage.PROD:
				return ConfigCCPAProd;
		}
	}
}



const ConfigTcfv2Prod: T_Config = {
	stage: E_Stage.PROD,
	jurisdiction: E_Jurisdiction.TCFV2,
	frontUrl: 'https://www.theguardian.com',
	articleUrl:
		'https://www.theguardian.com/food/2020/dec/16/how-to-make-the-perfect-vegetarian-sausage-rolls-recipe-felicity-cloake',
	iframeDomain: 'https://sourcepoint.theguardian.com',
	checkFunction: mainCheckTcfV2,
};

const ConfigTcfv2Code: T_Config = {
	stage: E_Stage.CODE,
	jurisdiction: E_Jurisdiction.TCFV2,
	frontUrl: 'https://m.code.dev-theguardian.com',
	articleUrl:
		'https://m.code.dev-theguardian.com/food/2020/dec/16/how-to-make-the-perfect-vegetarian-sausage-rolls-recipe-felicity-cloake',
	iframeDomain: 'https://cdn.privacy-mgmt.com',
	checkFunction: mainCheckTcfV2,
};

const ConfigCCPAProd: T_Config = {
	stage: E_Stage.PROD,
	jurisdiction: E_Jurisdiction.CCPA,
	frontUrl: 'https://www.theguardian.com/us',
	articleUrl:
		'https://www.theguardian.com/food/2020/dec/16/how-to-make-the-perfect-vegetarian-sausage-rolls-recipe-felicity-cloake',
	iframeDomain: 'https://ccpa-notice.sp-prod.net',
	checkFunction: mainCheckCCPA,
};

const ConfigCCPACode: T_Config = {
	stage: E_Stage.CODE,
	jurisdiction: E_Jurisdiction.CCPA,
	frontUrl: 'https://m.code.dev-theguardian.com/us',
	articleUrl:
		'https://m.code.dev-theguardian.com/food/2020/dec/16/how-to-make-the-perfect-vegetarian-sausage-rolls-recipe-felicity-cloake',
	iframeDomain: 'https://ccpa-notice.sp-prod.net',
	checkFunction: mainCheckCCPA,
};

const ConfigAusProd: T_Config = {
	stage: E_Stage.PROD,
	jurisdiction: E_Jurisdiction.AUS,
	frontUrl: 'https://www.theguardian.com/au',
	articleUrl:
		'https://www.theguardian.com/food/2020/dec/16/how-to-make-the-perfect-vegetarian-sausage-rolls-recipe-felicity-cloake',
	iframeDomain: 'https://ccpa-notice.sp-prod.net',
	checkFunction: mainCheckAus,
};

const ConfigAusCode: T_Config = {
	stage: E_Stage.CODE,
	jurisdiction: E_Jurisdiction.AUS,
	frontUrl: 'https://m.code.dev-theguardian.com/au',
	articleUrl:
		'https://m.code.dev-theguardian.com/food/2020/dec/16/how-to-make-the-perfect-vegetarian-sausage-rolls-recipe-felicity-cloake',
	iframeDomain: 'https://ccpa-notice.sp-prod.net',
	checkFunction: mainCheckAus,
};


export {ConfigManager}

