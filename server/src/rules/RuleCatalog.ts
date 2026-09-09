import type { IComplianceRule } from '@sih/shared';
import { Rule6_1_a_Manufacturer } from './definitions/Rule6_1_a_Manufacturer.js';
import { Rule6_1_b_GenericName } from './definitions/Rule6_1_b_GenericName.js';
import { Rule6_1_c_NetQuantity } from './definitions/Rule6_1_c_NetQuantity.js';
import { Rule6_1_d_Dates } from './definitions/Rule6_1_d_Dates.js';
import { Rule6_1_e_MRP } from './definitions/Rule6_1_e_MRP.js';
import { Rule6_11_UnitSalePrice } from './definitions/Rule6_11_UnitSalePrice.js';
import { Rule6_1_n_ConsumerCare } from './definitions/Rule6_1_n_ConsumerCare.js';
import { Rule6_1_g_CountryOfOrigin } from './definitions/Rule6_1_g_CountryOfOrigin.js';

export class RuleCatalog {
  private static rules: Map<string, IComplianceRule> = new Map();

  static {
    // Register verified core Legal Metrology Rules
    RuleCatalog.registerRule(Rule6_1_a_Manufacturer);
    RuleCatalog.registerRule(Rule6_1_b_GenericName);
    RuleCatalog.registerRule(Rule6_1_c_NetQuantity);
    RuleCatalog.registerRule(Rule6_1_d_Dates);
    RuleCatalog.registerRule(Rule6_1_e_MRP);
    RuleCatalog.registerRule(Rule6_11_UnitSalePrice);
    RuleCatalog.registerRule(Rule6_1_n_ConsumerCare);
    RuleCatalog.registerRule(Rule6_1_g_CountryOfOrigin);
  }

  public static registerRule(rule: IComplianceRule): void {
    RuleCatalog.rules.set(rule.ruleId, rule);
  }

  public static getRule(ruleId: string): IComplianceRule | undefined {
    return RuleCatalog.rules.get(ruleId);
  }

  public static getAllRules(): IComplianceRule[] {
    return Array.from(RuleCatalog.rules.values());
  }
}
